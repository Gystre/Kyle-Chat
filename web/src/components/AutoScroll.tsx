import { Box } from "@chakra-ui/react";
import React, { Component } from "react";

// need class component here cuz functional components doesn't have didMount and didUpdate
class AutoScroll extends Component {
    messagesEnd: HTMLDivElement;

    scrollToBottom = () => {
        this.messagesEnd.scrollTop = this.messagesEnd.scrollHeight;
    };

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return (
            <Box
                id="chatBox"
                overflowY="auto"
                height={500}
                ref={(el) => {
                    this.messagesEnd = el;
                }}
            >
                {this.props.children}
            </Box>
        );
    }
}

export default AutoScroll;
