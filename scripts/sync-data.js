require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// 配置日志
const logFile = path.join(__dirname, '../logs/sync.log');
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
}

const octokit = new Octokit({
  auth: process.env.PAT_TOKEN,
  request: {
    retries: 3,
    retryAfter: 5
  }
});

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const dataPath = path.join(__dirname, '../data');

// 验证环境变量
function validateEnv() {
  const requiredEnvVars = ['PAT_TOKEN', 'REPO_OWNER', 'REPO_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`缺少必要的环境变量: ${missingVars.join(', ')}`);
  }
}

// 确保数据目录存在
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// 初始化数据文件
function initDataFiles() {
  log('初始化数据文件');
  const productsData = {
    constants: {
      imageBaseUrl: "https://readdy.ai/api/search-image?query=",
      avatarBaseUrl: "https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520",
      imageParams: "&width=600&height=400&orientation=landscape",
      avatarParams: "&width=48&height=48&orientation=squarish"
    },
    products: [],
    categories: [],
    lastUpdated: new Date().toISOString()
  };

  const subscribersData = {
    constants: {
      avatarBaseUrl: "https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520",
      avatarParams: "&width=48&height=48&orientation=squarish",
      rewards: {
        survey: {
          points: 100,
          description: "Complete user survey"
        },
        test: {
          points: 50,
          description: "Complete pet personality test"
        },
        preorder: {
          points: 200,
          description: "Pre-order new products"
        }
      }
    },
    subscriptionStats: {
      totalSubscribers: 0,
      activeSubscribers: 0,
      lastUpdated: new Date().toISOString()
    },
    subscribersByEmail: {},
    lastUpdated: new Date().toISOString()
  };

  try {
    fs.writeFileSync(
      path.join(dataPath, 'products.json'),
      JSON.stringify(productsData, null, 2)
    );
    fs.writeFileSync(
      path.join(dataPath, 'subscribers.json'),
      JSON.stringify(subscribersData, null, 2)
    );
    log('数据文件初始化成功');
  } catch (error) {
    log(`数据文件初始化失败: ${error.message}`, 'error');
    throw error;
  }
}

// 验证数据格式
function validateData(data, type) {
  if (!data || typeof data !== 'object') {
    throw new Error(`无效的${type}数据格式`);
  }
  
  if (type === 'products') {
    if (!data.constants || typeof data.constants !== 'object') {
      throw new Error('products.constants字段必须是对象');
    }
    if (!Array.isArray(data.products)) {
      throw new Error('products.products字段必须是数组');
    }
    if (!Array.isArray(data.categories)) {
      throw new Error('products.categories字段必须是数组');
    }
  } else if (type === 'subscribers') {
    if (!data.constants || typeof data.constants !== 'object') {
      throw new Error('subscribers.constants字段必须是对象');
    }
    if (!data.subscriptionStats || typeof data.subscriptionStats !== 'object') {
      throw new Error('subscribers.subscriptionStats字段必须是对象');
    }
    if (!data.subscribersByEmail || typeof data.subscribersByEmail !== 'object') {
      throw new Error('subscribers.subscribersByEmail字段必须是对象');
    }
  }
}

async function syncData() {
  try {
    log('开始数据同步');
    validateEnv();

    // 检查数据文件是否存在
    if (!fs.existsSync(path.join(dataPath, 'products.json')) ||
        !fs.existsSync(path.join(dataPath, 'subscribers.json'))) {
      initDataFiles();
    }

    // 读取本地数据文件
    const productsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'products.json'), 'utf8'));
    const subscribersData = JSON.parse(fs.readFileSync(path.join(dataPath, 'subscribers.json'), 'utf8'));

    // 验证数据格式
    validateData(productsData, 'products');
    validateData(subscribersData, 'subscribers');

    // 更新最后更新时间
    productsData.lastUpdated = new Date().toISOString();
    subscribersData.lastUpdated = new Date().toISOString();
    subscribersData.subscriptionStats.lastUpdated = new Date().toISOString();

    // 更新订阅统计
    const activeSubscribers = Object.values(subscribersData.subscribersByEmail)
      .filter(subscriber => subscriber.subscription.status === 'active').length;
    subscribersData.subscriptionStats.totalSubscribers = Object.keys(subscribersData.subscribersByEmail).length;
    subscribersData.subscriptionStats.activeSubscribers = activeSubscribers;

    // 更新GitHub上的数据文件
    await updateFile('data/products.json', productsData);
    await updateFile('data/subscribers.json', subscribersData);

    log('数据同步成功');
  } catch (error) {
    log(`数据同步失败: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function updateFile(path, content) {
  try {
    log(`更新文件: ${path}`);
    // 获取文件SHA
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    // 更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${path}`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha: data.sha
    });
    log(`文件更新成功: ${path}`);
  } catch (error) {
    if (error.status === 404) {
      log(`文件不存在，创建新文件: ${path}`);
      // 文件不存在，创建新文件
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Create ${path}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
      });
      log(`新文件创建成功: ${path}`);
    } else {
      log(`文件更新失败: ${error.message}`, 'error');
      throw error;
    }
  }
}

// 运行同步
syncData(); 