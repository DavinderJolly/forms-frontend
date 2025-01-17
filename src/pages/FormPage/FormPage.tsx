/** @jsx jsx */
import {jsx, css} from "@emotion/react";

import React, {createRef, SyntheticEvent, useEffect, useState} from "react";
import {useParams} from "react-router";
import {PropagateLoader} from "react-spinners";

import HeaderBar from "../../components/HeaderBar";
import RenderedQuestion from "../../components/Question";
import Loading from "../../components/Loading";
import ScrollToTop from "../../components/ScrollToTop";

import {Form, FormFeatures, getForm} from "../../api/forms";
import {OAuthScopes} from "../../api/auth";
import colors from "../../colors";
import {unselectable} from "../../commonStyles";

import handleSubmit, {FormState} from "./submit";
import Navigation from "./Navigation";
import Success from "./SuccessPage";
import ErrorPage from "./ErrorPage";


export type RefMapType =  Map<string, React.RefObject<RenderedQuestion>>;


const formStyles = css`
  margin: auto;
  width: 50%;

  @media (max-width: 800px) {
    /* Make form larger on mobile and tablet screens */
    width: 80%;
  }
`;

const closedHeaderStyles = css`
  margin-bottom: 2rem;
  padding: 1rem 4rem;
  border-radius: 8px;

  text-align: center;
  font-size: 1.5rem;

  background-color: ${colors.error};

  @media (max-width: 500px) {
    padding: 1rem 1.5rem;
  }
`;

function FormPage(): JSX.Element {
    const {id} = useParams<{id: string}>();

    const [form, setForm] = useState<Form>();
    const [state, setState] = useState<string>(FormState.INITIAL);

    const OAuthRef = createRef<HTMLDivElement>();

    useEffect(() => {
        // This can't be null due to the routing to get here
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        getForm(id!).then(form => {
            setForm(form);
        });
    }, []);

    if (!form) {
        return <Loading/>;
    }

    const refMap: RefMapType = new Map();

    // Authentication Logic
    const require_auth: boolean = form.features.includes(FormFeatures.RequiresLogin);
    const scopes: OAuthScopes[] = [];
    if (require_auth) {
        scopes.push(OAuthScopes.Identify);
        if (form.features.includes(FormFeatures.CollectEmail)) {
            scopes.push(OAuthScopes.Email);
        }
    }

    const open: boolean = form.features.includes(FormFeatures.Open);
    let closed_header = null;
    if (!open) {
        closed_header =
            <div css={closedHeaderStyles}>This form is now closed. You will not be able to submit your response.</div>;
    }

    // FIXME: Remove this ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const questions: RenderedQuestion[] = form.questions.map((question, index) => {
        const questionRef = createRef<RenderedQuestion>();
        refMap.set(question.id, questionRef);

        return <RenderedQuestion
            question={question}
            scroll_ref={createRef<HTMLDivElement>()}
            focus_ref={createRef<any>()} // eslint-disable-line @typescript-eslint/no-explicit-any
            key={index + Date.now()}
            selfRef={questionRef}
            ref={questionRef}
        />;
    });

    switch (state) {
        case FormState.SENT:
            return <Success form={form}/>;
        case FormState.SENDING:
            return (
                <div>
                    <HeaderBar title={"Submitting..."}/>
                    <div css={{display: "flex", justifyContent: "center", paddingTop: "40px"}}>
                        <PropagateLoader color="white"/>
                    </div>
                </div>
            );

        case FormState.UNKNOWN_ERROR:
            return <ErrorPage
                form={form}
                message="An unknown error occurred, please contact the forms team or try again."
            />;
    }

    const handler = (event: SyntheticEvent) => handleSubmit(event, form.id, questions, refMap, setState, OAuthRef, scopes);

    return (
        <div>
            <HeaderBar title={form.name} description={form.description}/>

            <div>
                <form id="form" onSubmit={handler} css={[formStyles, unselectable]}>
                    {closed_header}
                    {questions}
                </form>
                <Navigation form_state={open} scopes={scopes}/>
            </div>

            <div css={css`margin-bottom: 10rem`}/>
            <ScrollToTop/>
        </div>
    );
}

export default FormPage;
