import React, { createContext, useContext, useState, useCallback } from "react";
import CustomAlert from "../components/common/CustomAlert";

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlert = useCallback(({ title, message, type = "info", buttons = [] }) => {
    // Wrap buttons to ensure they close the alert
    const wrappedButtons = buttons.length > 0 ? buttons.map(btn => ({
      ...btn,
      onPress: async () => {
        if (btn.onPress) await btn.onPress();
        hideAlert();
      }
    })) : [{ text: "OK", onPress: () => hideAlert() }];

    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons: wrappedButtons,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};
