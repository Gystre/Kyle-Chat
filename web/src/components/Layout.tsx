import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Link } from "@chakra-ui/layout";
import { Grid, Button, Icon } from "@chakra-ui/react";
import React from "react";
import { Navbar } from "./Navbar";
import NextLink from "next/link";
import { PersonIcon } from "./PersonIcon";
import { ChatIcon } from "@chakra-ui/icons";

/*
Any children we pass into this component will be placed into the right side of the 
two column layout we have
*/

interface Props {}
export const Layout: React.FC<Props> = ({ children }) => {
    const { colorMode } = useColorMode();
    const bgColor = { light: "gray.200", dark: "gray.800" };
    const color = { light: "black", dark: "white" };

    return (
        <>
            <Navbar />
            <Grid templateColumns="200px 1fr">
                <Box h="100vh" bg={bgColor[colorMode]} color={color[colorMode]}>
                    <NextLink href="/friends">
                        <Link cursor="pointer">
                            <Box
                                p="3"
                                m="3"
                                textAlign="left"
                                borderRadius="3px"
                                _hover={{ bgColor: "green.200" }}
                            >
                                <PersonIcon />
                                Friends
                            </Box>
                        </Link>
                    </NextLink>
                    <NextLink href="/friends">
                        <Link cursor="pointer">
                            <Box
                                p="3"
                                m="3"
                                textAlign="left"
                                borderRadius="3px"
                                _hover={{ bgColor: "green.200" }}
                            >
                                <ChatIcon w="8" h="8" mr="3" />
                                Main Chat!
                            </Box>
                        </Link>
                    </NextLink>
                    <Box fontSize="small" mt="5" ml="6">
                        <b style={{ letterSpacing: "1px" }}>DIRECT MESSAGES</b>
                        {/* below here will be a list of users that are fetched when the page is loaded */}
                    </Box>
                </Box>
                <Box>{children}</Box>
            </Grid>
        </>
    );
};
