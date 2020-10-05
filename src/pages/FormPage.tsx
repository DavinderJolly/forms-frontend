/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Link } from "react-router-dom";

import { DotLoader } from "react-spinners";

import { useParams } from "react-router";
import HeaderBar from "../components/HeaderBar";
import { useEffect, useState } from "react";
import { Form, getForm } from "../api/forms";

interface PathParams {
    id: string
}

function Loading() {
    return <div>
        <HeaderBar title={"Loading..."}/>
        <div css={{display: "flex", justifyContent: "center"}}>
            <DotLoader color="white"/>
        </div>
    </div>
}

function FormPage() {
    const { id } = useParams<PathParams>();

    const [form, setForm] = useState<Form>();

    useEffect(() => {
        getForm(id).then(form => {
            setForm(form);
        })
    })

    if (!form) {
        return <Loading/>
    }

    return <div>
        <HeaderBar title={form.title}/>
        <div css={{marginLeft: "20px"}}>
            <h1>{form.description}</h1>
            <Link to="/" css={{color: "white"}}>Return home</Link>
        </div>
    </div>
}

export default FormPage;