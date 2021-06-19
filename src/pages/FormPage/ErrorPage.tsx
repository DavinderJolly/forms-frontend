/** @jsx jsx */
import { jsx, css } from "@emotion/react";
import { Link } from "react-router-dom";
import React from "react";

import { Form } from "../../api/forms";
import {Question, QuestionType} from "../../api/question";
import RenderedQuestion from "../../components/Question";
import HeaderBar from "../../components/HeaderBar";
import {selectable, submitStyles, unselectable} from "../../commonStyles";

import Navigation from "./Navigation";
import {parseAnswers} from "./submit";


interface ErrorProps {
    form: Form
    questions: RenderedQuestion[]
    message: string
}

function refresh(form: Form, questions: RenderedQuestion[]): void {
    console.log(questions);
    // Store saved question IDs
    localStorage.setItem(`saved_questions_${form.id}`, form.questions.reduce((previous: string, current: Question) => `${previous}|${current.id}`, ""));

    // Store question data
    console.log(parseAnswers(questions));
}

export default function ErrorPage(props: ErrorProps): JSX.Element {
    return (
        <div>
            <HeaderBar title={props.form.name} description={props.form.description}/>
            <div css={[unselectable, Navigation.containerStyles]}>
                <h3 css={selectable}>{props.message}</h3>
                <div className={ "return_button" }>
                    <Link to="/" css={Navigation.returnStyles}>Return Home</Link>
                </div>
                <br css={Navigation.separatorStyles}/>
                <div css={submitStyles}>
                    <button type="button" css={css`padding: 0.55rem 4.25rem;`} onClick={() => refresh(props.form, props.questions)}>Refresh</button>
                </div>
            </div>
        </div>
    );
}
