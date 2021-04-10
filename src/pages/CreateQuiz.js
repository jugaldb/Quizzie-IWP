import React, { useState, useEffect } from "react";
import "./CreateQuiz.css";
import {
	Container,
	Typography,
	Grid,
	Slider,
	Select,
	MenuItem,
	Button,
	Snackbar,
} from "@material-ui/core";
import TextInput from "../components/TextInput";
import {
	KeyboardDatePicker,
	KeyboardTimePicker,
	MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import axios from "axios";
import { Redirect } from "react-router";
import Loading from "./Loading";
import { Alert } from "@material-ui/lab";
import { AccessAlarm } from "@material-ui/icons";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

function CreateQuiz() {
	const [quizName, setQuizName] = useState("");
	const [quizDate, setQuizDate] = useState(new Date());
	const [duration, setDuration] = useState(5);
	const [type, setType] = useState("private");

	const [loading, setLoading] = useState(false);
	const [redirect, setRedirect] = useState(false);
	const [redirectEdit, setRedirectEdit] = useState(false);
	const [quizId, setQuizId] = useState("");

	const backend = process.env.REACT_APP_BACKEND_URL;

	const [error, setError] = useState(false);

	const { executeRecaptcha } = useGoogleReCaptcha();

	const onQuizNameChange = (event) => {
		setQuizName(event.target.value);
	};

	const handleDateChange = (date) => {
		setQuizDate(date);
	};

	const handleTimeChange = (e, val) => {
		setDuration(val);
	};

	const onTypeChange = (event) => {
		setType(event.target.value);
	};

	const handleSubmit = async () => {
		setLoading(true);
		let token = localStorage.getItem("authToken");
		let url = `${backend}/quiz/createQuiz`;

		let captcha = await executeRecaptcha("create_quiz");

		let data = {
			quizName: quizName,
			scheduledFor: quizDate.getTime(),
			quizDuration: duration,
			quizType: type,
			captcha: captcha,
		};

		try {
			await axios
				.post(url, data, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setQuizId(res.data.result._id);
					setLoading(false);
					setRedirectEdit(true);
				});
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		let token = localStorage.getItem("authToken");
		if (token === null) {
			setLoading(false);
			setRedirect(true);
			return;
		}
	}, []);

	