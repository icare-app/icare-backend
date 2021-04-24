import React from "react";

import { IconButton } from '@fluentui/react/lib/Button';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { ImageFit } from '@fluentui/react/lib/Image';
import {
    DocumentCard,
    DocumentCardImage,
    DocumentCardActions
} from '@fluentui/react/lib/DocumentCard';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Dialog } from '@fluentui/react/lib/Dialog';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

const divStyle = {
    paddingTop: '10px',
    paddingLeft: '30px'
};

const cardStyles = {
    root: {
        display: 'inline-block',
        width: 240,
        marginRight: '16px',
        marginBottom: '16px'
    }
}

const cardStackStyle = {
    marginTop: "8px",
    marginLeft: "16px",
    marginRight: "16px",
    height: "auto"
}

export default class InsightsScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cards: store.insights.getAll().cards
        };
        this.handleRefreshBtn = this.handleRefreshBtn.bind(this);
    };

    componentDidMount() {
        // Update this component's state when insights are updated
        store.insights.eventSystem.on('changed', () => {
            this.updateState();
        })
    };

    setSpinner(isLoading) {
        let state = this.state;
        state.isLoading = isLoading;
        this.setState(state);
    }

    handleRefreshBtn() {
        this.setSpinner(true);
        store.insights.fetch()
            .then(result => {
                if (!result.success) {
                    store.messages.add({
                        type: MessageBarType.error,
                        contents: `Failed to retrieve insights: ${result.data.message}`
                    });
                } 
                this.setSpinner(false);
            });
    }

    updateState() {
        this.setState({
            cards: store.insights.getAll().cards
        });
    };

    render() {

        // Map all card objects in the state to React components
        const cards = this.state.cards.map( card => {
            return (
                <DocumentCard styles={cardStyles} >
    
                    {/* Card image */}
                    <DocumentCardImage 
                        height={100} 
                        imageFit={ImageFit.cover} 
                        iconProps={{
                            iconName: 'RedEye',
                            styles: { root: { color: '#ffffff', fontSize: '96px', width: '96px', height: '96px' } }
                        }}
                    />
    
                    {/* Card contents/stack */}
                    <Stack style={cardStackStyle} tokens={{ childrenGap: 8 }}>
                        <Text variant="large" block> {card.header} </Text>
                        <Text block> {card.content} </Text>
                    </Stack>
    
                    {/* Card action buttons */}
                    <DocumentCardActions actions={[
                        {
                            iconProps: { iconName: 'Like' },
                            onClick: () => { alert('Like clicked') }
                        },
                        {
                            iconProps: { iconName: 'Dislike' },
                            onClick: () => { alert('Dislike clicked') }
                        }
                    ]} />
    
                </DocumentCard>
            );
        });     

        // Create the Insights screen
        return (

            <div style={divStyle}>

                {/* Insights screen header */}
                <Stack horizontal
                    verticalAlign="center"
                    tokens={{ childrenGap: 16 }} >
                    <Text variant={'xxLarge'} block> <b>Insights</b> </Text>

                    <TooltipHost content="Refresh">
                        <IconButton
                            iconProps={{ iconName: 'Refresh' }}
                            onClick={this.handleRefreshBtn}
                        />
                    </TooltipHost>
                </Stack>

                {/* Insights contents */}
                <ScrollablePane style={{
                    position: "absolute",
                    top: "105px",
                    left: "30px",
                    paddingBottom: "260px",
                    paddingRight: "40px"
                }}>
                    {cards}
                </ScrollablePane>

                {/* Spinner that shows when loading */}
                <Dialog hidden={!this.state.isLoading}>
                    <Spinner label='Syncing your preferences' size={SpinnerSize.large} />
                </Dialog>

            </div>

        );
    }
}