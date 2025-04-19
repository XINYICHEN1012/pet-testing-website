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
      imageBaseUrl: 'https://readdy.ai/api/search-image?query=',
      avatarBaseUrl: 'https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520',
      imageParams: '&width=600&height=400&orientation=landscape',
      avatarParams: '&width=48&height=48&orientation=squarish'
    },
    products: [],
    categories: [],
    lastUpdated: new Date().toISOString()
  };

  const subscribersData = {
    constants: {
      avatarBaseUrl: 'https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520',
      avatarParams: '&width=48&height=48&orientation=squarish',
      rewards: {
        survey: {
          points: 100,
          description: 'Complete user survey'
        },
        test: {
          points: 50,
          description: 'Complete pet personality test'
        },
        preorder: {
          points: 200,
          description: 'Pre-order new products'
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

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../data/products.json');

// 同步数据
async function syncData() {
  try {
    // 读取现有数据
    let existingData = {};
    if (fs.existsSync(DATA_FILE)) {
      existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    // 读取用户交互数据
    const userData = JSON.parse(process.env.USER_INTERACTION_DATA || '{}');

    // 合并数据
    const mergedData = {
      ...existingData,
      products: mergeProducts(existingData.products || [], userData.products || [])
    };

    // 保存合并后的数据
    fs.writeFileSync(DATA_FILE, JSON.stringify(mergedData, null, 2));
    console.log('数据同步成功');
  } catch (error) {
    console.error('数据同步失败:', error);
    process.exit(1);
  }
}

// 合并产品数据
function mergeProducts(existingProducts, newProducts) {
  const productMap = new Map();
  
  // 添加现有产品
  existingProducts.forEach(product => {
    productMap.set(product.id, product);
  });
  
  // 更新或添加新产品
  newProducts.forEach(product => {
    if (productMap.has(product.id)) {
      // 更新现有产品
      const existingProduct = productMap.get(product.id);
      productMap.set(product.id, {
        ...existingProduct,
        ...product,
        stats: {
          ...existingProduct.stats,
          ...product.stats
        }
      });
    } else {
      // 添加新产品
      productMap.set(product.id, product);
    }
  });
  
  return Array.from(productMap.values());
}

// 执行同步
syncData();