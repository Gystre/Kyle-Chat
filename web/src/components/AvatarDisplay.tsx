import { Flex, Avatar, CloseButton, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    imageUrl: string;
    name: string;
    closeButton?: boolean; //whether or not you want the little x button to show
}
export const AvatarDisplay: React.FC<Props> = ({
    imageUrl,
    name,
    closeButton,
}) => {
    return (
        <Flex flexDirection="row" alignItems="center">
            <Avatar size="md" src={imageUrl} />
            <Text ml="2" fontSize="md">
                {name}
            </Text>
            {closeButton ? <CloseButton ml="auto" mr="2" size="md" /> : null}
        </Flex>
    );
};
