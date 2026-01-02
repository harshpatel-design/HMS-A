import { message } from "antd";
import { createContext } from "react";

export const MessageContext = createContext(null);

export default function GlobalMessageProvider({ children }) {
  const [msgApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={msgApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
}
