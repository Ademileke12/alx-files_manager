// utils/redis.js

import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, count) => {
        if (error) {
          reject(error);
        } else {
          resolve(count);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
