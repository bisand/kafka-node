import { Readable, Writable } from 'stream';
import { EventEmitter } from 'events';

export class KafkaClient extends EventEmitter {
  constructor (options?: KafkaClientOptions);

  close (cb?: () => void): void;

  topicExists (topics: string[], cb: (error?: TopicsNotExistError | any) => any): void;

  refreshMetadata (topics: string[], cb?: (error?: any) => any): void;

  sendOffsetCommitV2Request (group: string, generationId: number, memberId: string, commits: OffsetCommitRequest[], cb: (error: any, data: any) => any): void;

  // Note: socket_error is currently KafkaClient only, and zkReconnect is currently Client only.
  on (eventName: 'brokersChanged' | 'close' | 'connect' | 'ready' | 'reconnect' | 'zkReconnect', cb: () => any): this;
  on (eventName: 'error' | 'socket_error', cb: (error: any) => any): this;

  connect (): void;
}

export class Producer {
  constructor (client: KafkaClient, options?: ProducerOptions, customPartitioner?: CustomPartitioner);

  on (eventName: 'ready', cb: () => any): void;
  on (eventName: 'error', cb: (error: any) => any): void;

  send (payloads: ProduceRequest[], cb: (error: any, data: any) => any): void;

  createTopics (topics: string[], async: boolean, cb: (error: any, data: any) => any): void;
  createTopics (topics: string[], cb: (error: any, data: any) => any): void;

  close (cb?: () => any): void;
}

export class HighLevelProducer extends Producer {
}

export class Consumer {
  client: KafkaClient;

  constructor (client: KafkaClient, fetchRequests: Array<OffsetFetchRequest | string>, options: ConsumerOptions);

  on (eventName: 'message', cb: (message: Message) => any): void;
  on (eventName: 'error' | 'offsetOutOfRange', cb: (error: any) => any): void;

  addTopics<T extends string[] | Topic[]> (topics: T, cb: (error: any, added: T) => any, fromOffset?: boolean): void;

  removeTopics (topics: string | string[], cb: (error: any, removed: number) => any): void;

  commit (cb: (error: any, data: any) => any): void;
  commit (force: boolean, cb: (error: any, data: any) => any): void;

  setOffset (topic: string, partition: number, offset: number): void;

  pause (): void;

  resume (): void;

  pauseTopics (topics: any[] /* Array<string|Topic> */): void;

  resumeTopics (topics: any[] /* Array<string|Topic> */): void;

  close (force: boolean, cb: (error: Error) => any): void;
  close (cb: (error: Error) => any): void;
}

export class ConsumerGroupStream extends Readable {
  client: KafkaClient;
  consumerGroup: ConsumerGroup;

  constructor (options: ConsumerGroupStreamOptions, topics: string | string[]);

  commit (message: Message, force?: boolean, cb?: (error: any, data: any) => any): void;

  transmitMessages (): void;

  close (cb: () => any): void;
}

export class ConsumerGroup {
  generationId: number;
  memberId: string;
  client: KafkaClient;

  constructor (options: ConsumerGroupOptions, topics: string[] | string);

  close (force: boolean, cb: (error: Error) => any): void;
  close (cb: (error: Error) => any): void;

  on (eventName: 'message', cb: (message: Message) => any): void;
  on (eventName: 'error' | 'offsetOutOfRange', cb: (error: any) => any): void;
  on (eventName: 'rebalancing' | 'rebalanced', cb: () => any): void;

  addTopics (topics: string[] | Topic[], cb?: (error: any, added: string[] | Topic[]) => any): void;

  removeTopics (topics: string | string[], cb: (error: any, removed: number) => any): void;

  commit (cb: (error: any, data: any) => any): void;
  commit (force: boolean, cb: (error: any, data: any) => any): void;

  sendOffsetCommitRequest (commits: OffsetCommitRequest[], cb: (error: any, data: any) => any): void;

  setOffset (topic: string, partition: number, offset: number): void;

  pause (): void;

  resume (): void;
}

export class Offset {
  constructor (client: KafkaClient);

  on (eventName: 'ready' | 'connect', cb: () => any): void;
  on (eventName: 'error', cb: (error: any) => any): void;

  fetch (payloads: OffsetRequest[], cb: (error: any, data: any) => any): void;

  commit (groupId: string, payloads: OffsetCommitRequest[], cb: (error: any, data: any) => any): void;

  fetchCommits (groupId: string, payloads: OffsetFetchRequest[], cb: (error: any, data: any) => any): void;

  fetchLatestOffsets (topics: string[], cb: (error: any, data: any) => any): void;

  fetchEarliestOffsets (topics: string[], cb: (error: any, data: any) => any): void;
}

export class KeyedMessage {
  constructor (key: string, value: string | Buffer);
}

export class ProducerStream extends Writable {
  constructor (options?: ProducerStreamOptions);

  sendPayload (payloads: ProduceRequest[], cb: (error: any, data: any) => any): void;

  close (cb?: () => any): void;

  _write (message: ProduceRequest, encoding: 'buffer' | 'utf8', cb: (error: any, data: any) => any): void;

  _writev (chunks: Chunk[], cb: (error: any, data: any) => any): void;
}

// # Interfaces

export interface Message {
  topic: string;
  value: string | Buffer;
  offset?: number;
  partition?: number;
  highWaterOffset?: number;
  key?: string;
}

export interface ProducerOptions {
  requireAcks?: number;
  ackTimeoutMs?: number;
  partitionerType?: number;
}

export interface KafkaClientOptions {
  kafkaHost?: string;
  connectTimeout?: number;
  requestTimeout?: number;
  autoConnect?: boolean;
  connectRetryOptions?: RetryOptions;
  sslOptions?: any;
  clientId?: string;
}

export interface ProducerStreamOptions {
  kafkaClient?: KafkaClientOptions;
  producer?: ProducerOptions;
  highWaterMark?: number;
}

export interface RetryOptions {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
}

export interface AckBatchOptions {
  noAckBatchSize: number | null;
  noAckBatchAge: number | null;
}

export interface ProduceRequest {
  topic: string;
  messages: any; // string[] | Array<KeyedMessage> | string | KeyedMessage
  key?: string;
  partition?: number;
  attributes?: number;
}

export interface ConsumerOptions {
  groupId?: string;
  autoCommit?: boolean;
  autoCommitIntervalMs?: number;
  fetchMaxWaitMs?: number;
  fetchMinBytes?: number;
  fetchMaxBytes?: number;
  fromOffset?: boolean;
  encoding?: 'buffer' | 'utf8';
  keyEncoding?: 'buffer' | 'utf8';
}

export interface CustomPartitionAssignmentProtocol {
  name: string;
  version: number;
  userData: {};

  assign (topicPattern: any, groupMembers: any, cb: (error: any, result: any) => void): void;
}

export interface ConsumerGroupOptions {
  kafkaHost?: string;
  batch?: AckBatchOptions;
  ssl?: boolean;
  sslOptions?: any;
  id?: string;
  groupId: string;
  sessionTimeout?: number;
  encoding?: 'buffer' | 'utf8';
  keyEncoding?: 'buffer' | 'utf8';
  protocol?: Array<'roundrobin' | 'range' | CustomPartitionAssignmentProtocol>;
  fromOffset?: 'earliest' | 'latest' | 'none';
  outOfRangeOffset?: 'earliest' | 'latest' | 'none';
  migrateHLC?: boolean;
  migrateRolling?: boolean;
  autoCommit?: boolean;
  autoCommitIntervalMs?: number;
  fetchMaxWaitMs?: number;
  maxNumSegments?: number;
  maxTickMessages?: number;
  fetchMinBytes?: number;
  fetchMaxBytes?: number;
  retries?: number;
  retryFactor?: number;
  retryMinTimeout?: number;
  connectOnReady?: boolean;
  heartbeatInterval?: number;
  onRebalance?: () => Promise<void>;
}

export interface ConsumerGroupStreamOptions extends ConsumerGroupOptions {
  highWaterMark?: number;
}

export interface Topic {
  topic: string;
  offset?: number;
  encoding?: string;
  autoCommit?: boolean;
}

export interface OffsetRequest {
  topic: string;
  partition?: number;
  time?: number;
  maxNum?: number;
}

export interface OffsetCommitRequest {
  topic: string;
  partition?: number;
  offset: number;
  metadata?: string;
}

export interface OffsetFetchRequest {
  topic: string;
  partition?: number;
  offset?: number;
}

export interface Chunk {
  chunk: ProduceRequest;
}

export class TopicsNotExistError extends Error {
  topics: string | string[];
}

export type CustomPartitioner = (partitions: number[], key: any) => number;