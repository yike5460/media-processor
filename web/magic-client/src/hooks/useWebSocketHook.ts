// webSocketHook.js
import { useState, useEffect } from "react";

// define a custom hook
// accept the url to connect to
// number of times the hook should retry a connection
// the interval between retries
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function useWebSocketLite({
  socketUrl = "",
  retry: defaultRetry = 3000,
  retryInterval = 1500,
}) {
  // message and timestamp
  const [data, setData] = useState<any>();
  // send function
  const [send, setSend] = useState<any>(() => () => undefined);
  // state of our connection
  const [retry, setRetry] = useState(defaultRetry);
  // retry counter
  const [readyState, setReadyState] = useState(false);

  useEffect(() => {
    console.info("socketUrl:", socketUrl);
    const ws = new WebSocket(socketUrl);
    console.info("ws:", ws);
    ws.onopen = () => {
      console.log("Connected to socket");
      setReadyState(true);

      // function to send messages
      setSend((): any => {
        return (data: any) => {
          try {
            const d = JSON.stringify(data);
            ws.send(d);
            return true;
          } catch (err) {
            return false;
          }
        };
      });

      ws.onclose = (event: any) => {
        setReadyState(false);
        console.info("Close event:", event);
        const msg = formatMessage(event.data);
        setTimeout(() => {
          setRetry((retry) => retry - 1);
        }, retryInterval);
        setData({ message: msg, timestamp: getTimestamp() });
      };

      // receive messages
      ws.onmessage = (event: any) => {
        const msg = formatMessage(event.data);
        setData({ message: msg, timestamp: getTimestamp() });
      };
    };

    // on close we should update connection state
    // and retry connection
    ws.onclose = () => {
      console.info("DISCONNECT");
      setReadyState(false);
      // retry logic
      if (retry > 0) {
        setTimeout(() => {
          setRetry((retry) => retry - 1);
        }, retryInterval);
      }
    };
    // terminate connection on unmount
    return () => {
      ws.close();
    };
    // retry dependency here triggers the connection attempt
  }, [retry]);

  return { send, data, readyState };
}

// small utilities that we need
// handle json messages
function formatMessage(data: any): any {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (err) {
    return data;
  }
}

// get epoch timestamp
function getTimestamp() {
  return new Date().getTime();
}

export default useWebSocketLite;
