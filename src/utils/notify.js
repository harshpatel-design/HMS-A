import { message as antdMessage, notification as antdNotification } from "antd";

// Enable messages by default. Set REACT_APP_ENABLE_MESSAGES=false to disable.
const ENABLE_MESSAGES = process.env.REACT_APP_ENABLE_MESSAGES !== "false";

const notify = {
    success: (content, duration = 3) => {
        if (!ENABLE_MESSAGES) return null;
        return antdMessage.success(content, duration);
    },
    error: (content, duration = 3) => {
        if (!ENABLE_MESSAGES) return null;
        return antdMessage.error(content, duration);
    },
    info: (content, duration = 3) => {
        if (!ENABLE_MESSAGES) return null;
        return antdMessage.info(content, duration);
    },
    warning: (content, duration = 3) => {
        if (!ENABLE_MESSAGES) return null;
        return antdMessage.warning(content, duration);
    },
    open: (...args) => {
        if (!ENABLE_MESSAGES) return null;
        return antdMessage.open(...args);
    },
    destroy: () => antdMessage.destroy(),
};

// Notification wrapper
notify.notification = {
    success: (options) => {
        if (!ENABLE_MESSAGES) return null;
        return antdNotification.success(options);
    },
    error: (options) => {
        if (!ENABLE_MESSAGES) return null;
        return antdNotification.error(options);
    },
    info: (options) => {
        if (!ENABLE_MESSAGES) return null;
        return antdNotification.info(options);
    },
    warning: (options) => {
        if (!ENABLE_MESSAGES) return null;
        return antdNotification.warning(options);
    },
    open: (options) => {
        if (!ENABLE_MESSAGES) return null;
        return antdNotification.open(options);
    },
    destroy: () => antdNotification.destroy(),
};

export default notify;
