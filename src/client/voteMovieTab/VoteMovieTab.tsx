import * as React from "react";
import { Provider, Flex, Text, Button, Header, mergeThemes } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import Axios from "axios";
import { IResults } from "../../model/IResults";
import * as microsoftTeams from "@microsoft/teams-js";

/**
 * Implementation of the Vote Movie content page
 */
export const VoteMovieTab = () => {
    const video1Ref = React.useRef<HTMLVideoElement>(null);
    const video2Ref = React.useRef<HTMLVideoElement>(null);
    const video3Ref = React.useRef<HTMLVideoElement>(null);
    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [meetingId, setMeetingId] = useState<string | undefined>();
    const [movie1, setMovie1] = useState<string>();
    const [movie2, setMovie2] = useState<string>();
    const [movie3, setMovie3] = useState<string>();
    const [votes, setVotes] = useState<IResults>();
    const [votable, setVotable] = useState<boolean>(true);

    const vote = async (movie: number) => {        
        const response = await Axios.post(`https://${process.env.PUBLIC_HOSTNAME}/api/votenc/${meetingId}/${movie}/${context?.userObjectId}`);
        evalVotable(meetingId!);
    };

    const loadVotes = async (meeting: string) => {
        Axios.get(`https://${process.env.PUBLIC_HOSTNAME}/api/votesnc/${meeting}`).then((response) => {
                setVotes(response.data);
                setTimeout(() => loadVotes(meeting), 5000);
        });
    };
    
    const evalVotable = async (meetingID: string) => {
        const userID = context?.userObjectId;
        Axios.get(`https://${process.env.PUBLIC_HOSTNAME}/api/votable/${meetingID}/${userID}`).then((response) => {
                const config = response.data;
                setVotable(response.data);
            });
    };

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.appInitialization.notifySuccess();
        }
    }, [inTeams]);

    useEffect(() => {
        if (context) {
            let meeting = "";
            if (context.meetingId === "") {
                meeting = "alias";
            }
            else {
                meeting = context.meetingId!;
            }
            setMeetingId(meeting);
            Axios.get(`https://${process.env.PUBLIC_HOSTNAME}/api/config/${meeting}`).then((response) => {
                const config = response.data;
                setMovie1(config.movie1url);
                setMovie2(config.movie2url);
                setMovie3(config.movie3url);
            });
            loadVotes(meeting);
            evalVotable(meeting);
        }
    }, [context]);

    useEffect(() => {
        video1Ref!.current!.load();
    }, [movie1]);
    useEffect(() => {
        video2Ref!.current!.load();
    }, [movie2]);
    useEffect(() => {
        video3Ref!.current!.load();
    }, [movie3]);
    /**
     * The render() method to create the UI of the tab
     */
    return (
        <Provider theme={theme}>
            <Flex fill={true} column styles={{
                padding: ".8rem 0 .8rem .5rem"
            }}>
                <Flex.Item>
                    <Header content="Vote for your movie" />
                </Flex.Item>
                <Flex.Item>
                    <div>
                        <div>
                            <video ref={video1Ref} controls width={280} height={240}>
                                <source src={movie1} type="video/mp4"></source>
                            </video>
                        </div>
                        <div>
                            <video ref={video2Ref} controls width={280} height={240}>
                                <source src={movie2}></source>
                            </video>
                        </div>
                        <div>
                            <video ref={video3Ref} controls width={280} height={240}>
                                <source src={movie3}></source>
                            </video>
                        </div>
                        {votable && <div>
                            <div>
                                <Button className="voteBtn" onClick={() => vote(1)}>Vote Movie 1</Button>
                            </div>
                            <div>
                                <Button className="voteBtn" onClick={() => vote(2)}>Vote Movie 2</Button>
                            </div>
                            <div>
                                <Button className="voteBtn" onClick={() => vote(3)}>Vote Movie 3</Button>
                            </div>
                        </div>}
                    </div>
                </Flex.Item>
                <Flex.Item styles={{
                    padding: ".8rem 0 .8rem .5rem"
                }}>
                    <div>
                        <Text size="smaller" content={`Votes Movie 1: ${votes?.votes1}`} />
                        <Text size="smaller" content={`Votes Movie 2: ${votes?.votes2}`} />
                        <Text size="smaller" content={`Votes Movie 3: ${votes?.votes3}`} />
                    </div>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
