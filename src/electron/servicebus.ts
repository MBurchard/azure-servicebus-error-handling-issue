import { ProcessErrorArgs, ServiceBusClient, ServiceBusReceivedMessage } from '@azure/service-bus';
import dayjs from 'dayjs';

export async function subscribeServiceBus() {
  try {
    debug('subscribe to service bus');
    const connectionString = process.env.VUE_SERVICEBUS_CONNECTION_STRING;
    if (!connectionString) {
      error('missing configuration VITE_SERVICEBUS_CONNECTION_STRING');
      return;
    }
    debug('connection string:', connectionString);
    const subscription = process.env.VUE_SERVICEBUS_SUBSCRIPTION;
    if (!subscription) {
      error('missing configuration VITE_SERVICEBUS_SUBSCRIPTION');
      return;
    }
    debug('subscription:', subscription);
    const topic = process.env.VUE_SERVICEBUS_TOPIC;
    if (!topic) {
      error('missing configuration VITE_SERVICEBUS_TOPIC');
      return;
    }
    debug('topic:', topic);
    const client = new ServiceBusClient(connectionString);
    const receiver = client.createReceiver(topic, subscription);
    receiver.subscribe({
      async processMessage(message: ServiceBusReceivedMessage): Promise<void> {
        debug('got message:', message);
        await receiver.completeMessage(message);
      },
      async processError(args: ProcessErrorArgs): Promise<void> {
        handleServiceBusError(args);
      },
    });
  } catch (e) {
    error('error during servicebus initialisation', e);
  }
}

let handleServiceBusErrorCount = 0;
let lastSecond = -1;
/**
 * function to show that error handling is called way too often.
 * Method will only log once per second but count the calls.
 *
 * @param args
 */
function handleServiceBusError(args: ProcessErrorArgs) {
  handleServiceBusErrorCount++;
  const now = new Date();
  const second = now.getSeconds();
  if (second !== lastSecond) {
    error('call count:', handleServiceBusErrorCount, '- servicebus error:', args.error.message);
    handleServiceBusErrorCount = 0;
    lastSecond = second;
  }
}

function debug(...args: unknown[]) {
  console.debug(getTS(), '[DEBUG]', ...args);
}

function error(...args: unknown[]) {
  console.error(getTS(), '[ERROR]', ...args);
}

function getTS(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
}
