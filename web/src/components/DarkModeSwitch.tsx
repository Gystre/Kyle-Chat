import { Switch, useColorMode } from "@chakra-ui/react";
import React from "react";

export const DarkModeSwitch = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === "dark";
    return (
        <Switch
            mr="4px"
            color="green"
            isChecked={isDark}
            onChange={toggleColorMode}
        />
    );
};
