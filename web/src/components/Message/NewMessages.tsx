import { Button } from "@chakra-ui/react";
import React, { Component, useEffect, useState } from "react";
import { MessageFragmentFragment } from "../../generated/graphql";
import { socket } from "../../utils/socket";
import { Message } from "./Message";

// doing in seperate component here to avoid refetching getMessages
class NewMessages extends Component {
    state = {
        messages: [] as MessageFragmentFragment[],
    };

    componentDidMount(): void {
        // new message, add it to the state
        socket.on("newMessage", (msg: MessageFragmentFragment) => {
            this.setState({ messages: [...this.state.messages, msg] });

            var chatBox = document.getElementById("chatBox");
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }

    render() {
        return (
            <>
                {this.state.messages.map((msg) => {
                    return (
                        <Message
                            key={msg.id}
                            username={msg.author.username}
                            text={msg.text}
                            imageUrl={msg.author.imageUrl}
                            createdAt={new Date(msg.createdAt)
                                .getTime()
                                .toString()}
                        />
                    );
                })}
            </>
        );
    }
}

export default NewMessages;
