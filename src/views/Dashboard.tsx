import { Component } from "solid-js";
import { callAPI } from "../shared/utils";
import { useNavigate } from '@solidjs/router';

const Dashboard: Component = () => {
    const navigate = useNavigate();

    const onLogoutClicked = async () => {
        try {
            const res = await callAPI('/deauth', {}, 'post');
            if(res.code === 200) {
                console.log("Successfully deauthorizaed.");
                navigate('/');
            }
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <>
            <button onClick={onLogoutClicked}>Logout</button>
        </>
    )
};

export default Dashboard;