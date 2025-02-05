import dynamicImportWithRetry from '@fatso83/retry-dynamic-import/react-lazy'
import React from 'react'

export const LazyReact = dynamicImportWithRetry

export const LazyReactNaiveRetry: typeof React.lazy = (importer) => {
  const retryImport = async () => {
    try {
      return await importer()
    }
    catch (error) {
      // retry 5 times, with exponential back-off (doubling the delay)
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i))
        try {
          return await importer()
        }
        catch (e) {
          console.log('retrying import')
        }
      }
      throw error
    }
  }
  return React.lazy(retryImport)
}
