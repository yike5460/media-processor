export interface StreamType {
  id: string;
  key: string;
  description: string;
  outdate: string;
  isImage: boolean;
  isVideo: boolean;
  isOnDemand: boolean;
  isRelay: boolean;
  relayURL: string;
}

export interface AppConfigType {
  pullDNS: string;
  pushDNS: string;
}
