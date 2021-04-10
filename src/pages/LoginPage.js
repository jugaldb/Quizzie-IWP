import React, { useState, useEffect, useContext, useRef } from "react";
import "./LoginPage.css";
import "./GoogleButton.css";
import {
	Container,
	Typography,
	Button,
	InputAdornment,
	IconButton,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Link, Redirect } from "react-router-dom";
import TextInput from "../components/TextInput";
import * as EmailValidator from "email-validator";
import InfoContext from "../context/InfoContext";
import axios from "axios";
import Loading from "./Loading";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

function LoginPage(props) {
	const [email, changeEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [emailChanged, setEmailChanged] = useState(false);
	const [password, changePassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordChanged, setPasswordChanged] = useState(false);

	const [showPassword, setShowPassword] = useState(false);

	const [didLogin, setDidLogin] = useState(null);
	const [errorText, setErrorText] = useState(
		"Error Logging In! Try again...."
	);
	const [redirect, setRedirect] = useState(false);
	const [ownerRedirect, setOwnerRedirect] = useState(false);
	const [loginRedirect, setLoginRedirect] = useState(false);

	const [notVerified, setNotVerified] = useState(false);
	const [verifyMail, setVerifyMail] = useState("");

	const type = props.match.params.type;
	const type1 = type === "user" ? "user" : "organizer";

	const [isLoading, setLoading] = useState(false);

	const { executeRecaptcha } = useGoogleReCaptcha();

	const { setLoggedIn, changeName, setAuthToken, setAdmin } = useContext(
		InfoContext
	);

	const mailErrorText = "Email cannot be empty";
	const passwordErrorText = "Password cannot be empty";

	const backend = process.env.REACT_APP_BACKEND_URL;

	const handleEmailChange = (event) => {
		setEmailChanged(true);
		changeEmail(event.target.value);
	};

	const handlePasswordChange = (event) => {
		setPasswordChanged(true);
		changePassword(event.target.value);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const keyPress = (event) => {
		if (event.key === "Enter") {
			handleSubmit();
		}
	};

	useEffect(() => {
		if (email.length === 0) setEmailError(mailErrorText);
		else setEmailError("");

		if (password.length === 0) setPasswordError(passwordErrorText);
		else setPasswordError("");
	}, [email, password]);

	