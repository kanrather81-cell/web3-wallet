/**
 * Transaction Retry Service
 * Handles automatic retry logic for failed transactions
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export interface RetryableTransaction<T> {
  execute: () => Promise<T>;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: (result: T) => void;
  onFailure?: (error: Error) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export class TransactionRetryService {
  /**
   * Execute a transaction with automatic retry on failure
   */
  static async executeWithRetry<T>(
    transaction: RetryableTransaction<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let lastError: Error;
    let delay = finalConfig.initialDelay;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const result = await transaction.execute();
        transaction.onSuccess?.(result);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          transaction.onFailure?.(lastError);
          throw lastError;
        }

        // If this was the last attempt, throw the error
        if (attempt === finalConfig.maxRetries) {
          transaction.onFailure?.(lastError);
          throw lastError;
        }

        // Notify about retry
        transaction.onRetry?.(attempt + 1, lastError);

        // Wait before retrying with exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError!;
  }

  /**
   * Check if an error should not be retried
   */
  private static isNonRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code;

    // User rejected transaction
    if (
      errorCode === 4001 ||
      errorCode === 'ACTION_REJECTED' ||
      errorMessage.includes('user rejected') ||
      errorMessage.includes('user denied')
    ) {
      return true;
    }

    // Insufficient funds
    if (
      errorMessage.includes('insufficient funds') ||
      errorMessage.includes('insufficient balance')
    ) {
      return true;
    }

    // Invalid parameters
    if (
      errorMessage.includes('invalid') ||
      errorMessage.includes('malformed')
    ) {
      return true;
    }

    // Nonce too low (transaction already processed)
    if (
      errorMessage.includes('nonce too low') ||
      errorMessage.includes('already known')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Sleep for a specified duration
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retry configuration for different transaction types
   */
  static getConfigForTransactionType(type: 'standard' | 'critical' | 'fast'): RetryConfig {
    switch (type) {
      case 'critical':
        return {
          maxRetries: 5,
          initialDelay: 2000,
          maxDelay: 30000,
          backoffMultiplier: 2,
        };
      case 'fast':
        return {
          maxRetries: 2,
          initialDelay: 500,
          maxDelay: 5000,
          backoffMultiplier: 2,
        };
      case 'standard':
      default:
        return DEFAULT_CONFIG;
    }
  }
}

/**
 * Retry decorator for async functions
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return TransactionRetryService.executeWithRetry(
      {
        execute: () => fn(...args),
      },
      config
    );
  }) as T;
}
