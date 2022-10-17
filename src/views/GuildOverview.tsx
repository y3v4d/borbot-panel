import { useParams } from "@solidjs/router";
import { Component } from "solid-js";

const GuildOverview: Component = () => {
    const params = useParams();

    console.log(`I'm on server ${params.id}`);
    return (
        <div>I'm alright!</div>
    )
};

export default GuildOverview;