import axios from "axios"
import axiosRetry from "axios-retry"
import CircuitBreaker from "opossum"
import async from "async"

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })

const fetchDataWithRetry = async (url: string) => {
  try {
    const { data } = await axios.get(url)
    return data
  } catch (error: Error | unknown) {
    console.error("Failed to fetch data after retres", String(error))
  }
}

//Circuit Breaker configuration
const breaker = new CircuitBreaker(fetchDataWithRetry, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 5000,
})

breaker.fallback(() => "Service temporarily available")

const queue = async.queue(async ({ url }) => {
  try {
    const result = await breaker.fire(url)
    console.log({ result })
  } catch (error: Error | unknown) {
    console.error("Error fetching data", String(error))
  }
})

const fetchMultipleURLs = (urls: string[]) => {
  urls.forEach((url) => queue.push({ url }))
}

fetchMultipleURLs(Array(10).fill("http://localhost:3001/unstable"))
