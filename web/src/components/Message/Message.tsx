import { Avatar, Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { convertStringToDate } from "../../utils/convertStringToDate";
import { RichTextViewer } from "../RichTextViewer";

interface Props {
    username: string;
    imageUrl: string;
    text: string;
    createdAt: string;
}

export const Message: React.FC<Props> = ({
    username,
    imageUrl,
    text,
    createdAt,
}) => {
    return (
        <Flex p={5} shadow="md" borderWidth="1px">
            <Box flex={1}>
                <Avatar name={username} src={imageUrl} />
                <Heading fontSize="l">
                    {username} at {convertStringToDate(createdAt)}
                </Heading>
                <RichTextViewer textBody={JSON.parse(text)} />
            </Box>
        </Flex>
    );
};
