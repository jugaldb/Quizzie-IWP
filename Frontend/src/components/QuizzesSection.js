import React, { useState, useEffect } from "react";
import "./QuizzesSection.css";
import axios from "axios";
import QuizLoading from "./QuizLoading";
import {
	GridList,
	GridListTile,
	GridListTileBar,
	Typography,
	Button,
	Dialog,
	isWidthUp,
	withWidth,
	IconButton,
	Tooltip,
	Snackbar,
	DialogTitle,
} from "@material-ui/core";
import { Add, Check, Info, Block, PlayCircleFilled } from "@material-ui/icons";
import TextInput from "./TextInput";
import { Alert } from "@material-ui/lab";
import { Link, Redirect } from "react-router-dom";
import Loading from "../pages/Loading";
import countdown from "countdown";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

function QuizzesSection(props) {
	const [loading, setLoading] = useState(false);
	const [userType, setUserType] = useState(props.type);
	const [profile, setProfile] = useState(props.profile);
	const [quizzes, setQuizzes] = useState([]);
	const [quizzesEnrolled, setQuizzesEnrolled] = useState([]);

	const [joinModal, setJoinModal] = useState(false);
	const [quizCode, setQuizCode] = useState("");
	const [quizCodeError, setQuizCodeError] = useState(false);

	const [enrollModal, setEnrollModal] = useState(false);
	const [enrollQuizName, setEnrollQuiz] = useState("");
	const [enrollQuizId, setEnrollQuizId] = useState("");

	const [enrollSnack, setEnrollSnack] = useState(false);
	const [snackbar, setSnackBar] = useState(false);
	const [errorSnack, setErrorSnack] = useState(false);

	const [infoModal, setInfoModal] = useState(false);
	const [infoLoading, setInfoLoading] = useState(false);
	const [currQuiz, setCurrQuiz] = useState({});
	const [timeRemain, setTimeRemain] = useState("");

	const [startModal, setStartModal] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);
	const [redirectId, setRedirectId] = useState("");
	const [quizDetails, setQuizDetails] = useState({});

	const [earlyError, setEarlyError] = useState(false);
	const [lateError, setLateError] = useState(false);
	const [givenSnack, setGivenSnack] = useState(false);
	const [privateWrongCode, setPrivateWrongCode] = useState(false);
	const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

	const setRefresh = props.refresh;

	const { executeRecaptcha } = useGoogleReCaptcha();

	const getCols = () => {
		if (isWidthUp("md", props.width)) {
			return 3;
		}

		return 2;
	};

	const getInfoWidth = () => {
		if (isWidthUp("sm", props.width)) {
			return "45%";
		}

		return "80%";
	};

	const onCloseHandle = () => {
		setJoinModal(false);
		setInfoModal(false);
		setStartModal(false);

		setQuizCode("");
		setQuizCodeError(false);
		setEnrollModal(false);
		setEnrollQuiz("");
		setEnrollQuizId("");
		setTimeRemain("");
		setCurrQuiz({});
	};

	const onJoinClick = () => {
		setJoinModal(true);
	};

	const handleJoinChange = (event) => {
		setQuizCode(event.target.value);
	};

	const handleEnrollButton = (quiz) => {
		setEnrollQuiz(quiz.quizName);
		setEnrollQuizId(quiz._id);
		setEnrollModal(true);
	};

	const handleInfoButton = (quiz) => {
		setInfoModal(true);
		getQuizInfo(quiz.quizId._id);
	};

	const handleStartButton = (quiz) => {
		setEnrollQuiz(quiz.quizId.quizName);
		setEnrollQuizId(quiz.quizId._id);
		setStartModal(true);
	};

	const getQuizInfo = async (id) => {
		setInfoLoading(true);

		let token = localStorage.getItem("authToken");
		let url = `https://quizzie-api.herokuapp.com/quiz/${id}`;

		try {
			await axios
				.get(url, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setCurrQuiz(res.data.result);
					setInfoLoading(false);
				});
		} catch (error) {
			console.log(error);
			onCloseHandle();
			setInfoLoading(false);
		}
	};

	const handleJoinSubmit = async () => {
		if (quizCode.trim().length === 0) {
			setQuizCodeError(true);
			return;
		}
		setQuizCodeError(false);
		setEnrollSnack(true);
		let url = "https://quizzie-api.herokuapp.com/quiz/enrollPrivate";
		let token = localStorage.getItem("authToken");

		let captcha = await executeRecaptcha("join_private");

		let data = {
			quizCode: quizCode,
			captcha: captcha,
		};

		try {
			await axios
				.patch(url, data, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setRefresh(true);
					onCloseHandle();
					setSnackBar(true);
				});
		} catch (error) {
			setEnrollSnack(false);
			if (error.response.status === 404) {
				setPrivateWrongCode(true);
			} else if (error.response.status === 409) {
				setAlreadyEnrolled(true);
			} else {
				setErrorSnack(true);
			}
		}
	};

	const handleEnroll = async () => {
		setEnrollSnack(true);
		let token = localStorage.getItem("authToken");
		let url = "https://quizzie-api.herokuapp.com/quiz/enroll";

		let captcha = await executeRecaptcha("quiz_enroll");

		let data = {
			quizId: enrollQuizId,
			captcha: captcha,
		};

		try {
			await axios
				.patch(url, data, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setRefresh(true);
					onCloseHandle();
					setSnackBar(true);
				});
		} catch (error) {
			console.log(error);
			setErrorSnack(true);
		}
	};

	const handleUnenroll = async () => {
		setEnrollSnack(true);
		let token = localStorage.getItem("authToken");
		let url = "https://quizzie-api.herokuapp.com/quiz/unenroll";

		let captcha = await executeRecaptcha("quiz_unenroll");

		let data = {
			quizId: currQuiz._id,
			captcha: captcha,
		};

		try {
			await axios
				.patch(url, data, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setRefresh(true);
				});
		} catch (error) {
			console.log(error);
			setErrorSnack(true);
		}
	};

	const handleQuizStart = async () => {
		setEnrollSnack(true);
		let token = localStorage.getItem("authToken");
		let url = `https://quizzie-api.herokuapp.com/quiz/start`;

		let captcha = await executeRecaptcha("quiz_start");

		let data = {
			quizId: enrollQuizId,
			captcha: captcha,
		};

		try {
			await axios
				.patch(url, data, {
					headers: {
						"auth-token": token,
					},
				})
				.then((res) => {
					setRedirectId(data.quizId);
					setQuizDetails(res.data);
					setQuizStarted(true);
				});
		} catch (error) {
			setEnrollSnack(false);
			if (error.response.status === 401) {
				setEarlyError(true);
			} else if (error.response.status === 402) {
				setLateError(true);
			} else if (error.response.status === 405) {
				setGivenSnack(true);
			}
		}
	};

	const setupEnrolled = () => {
		let quizzes = [];

		profile.quizzesEnrolled.map((quiz) => {
			if (
				!profile.quizzesGiven.find((o) => o.quizId === quiz.quizId._id)
			) {
				quizzes.push(quiz);
			}
		});

		setQuizzesEnrolled(quizzes);
	};

	// const getQuizzes = async () => {
	// 	// setLoading(true);
	// 	let token = localStorage.getItem("authToken");
	// 	let url = "https://quizzie-api.herokuapp.com/quiz/all";

	// 	let quizList = [];

	// 	try {
	// 		await axios
	// 			.get(url, {
	// 				headers: {
	// 					"auth-token": token,
	// 				},
	// 			})
	// 			.then((res) => {
	// 				res.data.result.map((quiz) => {
	// 					if (quiz.quizType === "public") {
	// 						if (userType === "user") {
	// 							if (
	// 								!profile.quizzesEnrolled.find(
	// 									(o) => o.quizId._id === quiz._id
	// 								)
	// 							)
	// 								quizList.push(quiz);
	// 						} else quizList.push(quiz);
	// 					}
	// 				});

	// 				quizList.sort(function (a, b) {
	// 					return a.scheduledFor - b.scheduledFor;
	// 				});

	// 				setQuizzes(quizList);
	// 				setLoading(false);
	// 			});
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// };

	useEffect(() => {
		if (infoModal) {
			if (currQuiz.scheduledFor <= Date.now()) {
				setTimeRemain("Already Started!");
			} else {
				setTimeout(() => {
					setTimeRemain(
						countdown(
							new Date(),
							new Date(Number(currQuiz.scheduledFor))
						).toString()
					);
				}, 1000);
			}
		}
	});
	useEffect(()=>{
		setQuizzes([{"quizStatus":1,"quizRestart":0,"reminderSent":true,"_id":"5f9e23161b1ace0017e44480","quizName":"Test-project","adminId":{"userType":"Admin","isEmailVerified":true,"_id":"5f9e22fd1b1ace0017e4447f","googleId":100590325271609520000,"name":"Jugal Bhatt","email":"jugalbhatt3@gmail.com","quizzes":[{"_id":"5f9e23161b1ace0017e44481","quizId":"5f9e23161b1ace0017e44480"},{"_id":"607095d05d76450017b51d37","quizId":"607095cf5d76450017b51d36"}],"__v":0,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVHlwZSI6IkFkbWluIiwidXNlcklkIjoiNWY5ZTIyZmQxYjFhY2UwMDE3ZTQ0NDdmIiwiZW1haWwiOiJqdWdhbGJoYXR0M0BnbWFpbC5jb20iLCJuYW1lIjoiSnVnYWwgQmhhdHQiLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlhdCI6MTYxNzk5MTA3NSwiZXhwIjoxNjE4MDc3NDc1fQ.A9IQ_rXVw0akz-DuLL8lrPa54t4Rbf5xUnFpOGrL97o"},"scheduledFor":"1604199175741","quizDuration":"15","quizType":"public","usersParticipated":[{"responses":[{"description":"test-2","selected":"2","quesId":"5f9e23381b1ace0017e44487","correctAnswer":"2","options":[{"_id":"5f9e23381b1ace0017e44488","text":"1"},{"_id":"5f9e23381b1ace0017e44489","text":"2"},{"_id":"5f9e23381b1ace0017e4448a","text":"3"},{"_id":"5f9e23381b1ace0017e4448b","text":"4"}]},{"description":"Test-1","selected":"2","quesId":"5f9e23281b1ace0017e44482","correctAnswer":"1","options":[{"_id":"5f9e23281b1ace0017e44483","text":"1"},{"_id":"5f9e23281b1ace0017e44484","text":"2"},{"_id":"5f9e23281b1ace0017e44485","text":"3"},{"_id":"5f9e23281b1ace0017e44486","text":"4"}]}],"_id":"5f9e23f51b1ace0017e44490","userId":"5f9e22911b1ace0017e4447e","marks":1,"timeEnded":1604199413600,"timeStarted":1604199404452}],"usersEnrolled":[{"_id":"5f9e23661b1ace0017e4448c","userId":"5f9e22911b1ace0017e4447e"}]},{"quizStatus":1,"quizRestart":1,"reminderSent":true,"_id":"60705b05087268001723c79f","quizName":"iwp2","adminId":{"userType":"Admin","isEmailVerified":true,"_id":"6070413052ab540017bc2f53","email":"tanya.gupta2019@vitstudent.ac.in","password":"$2b$10$S.BxFqLPMj/bW7KbeIhFSuydPmsniJOT0Jw0pZuMos9Lvkz4e9jJe","name":"Tanya Gupta","mobileNumber":8447794252,"quizzes":[{"_id":"607041a052ab540017bc2f56","quizId":"607041a052ab540017bc2f55"},{"_id":"60705b05087268001723c7a0","quizId":"60705b05087268001723c79f"}],"__v":0,"verificationKey":null,"verificationKeyExpires":null},"scheduledFor":"1617976061713","quizDuration":"5","quizType":"public","usersParticipated":[],"usersEnrolled":[{"_id":"60705ba0087268001723c7a2","userId":"60705b6f087268001723c7a1"}]}])
	},[])
	useEffect(() => {
		if (userType === "user") setupEnrolled();
		// getQuizzes();
	}, []);

	if (loading) {
		return <QuizLoading />;
	} else if (quizStarted) {
		return (
			<Redirect
				to={{
					pathname: `/quiz`,
					state: {
						questions: quizDetails.data,
						duration: quizDetails.duration,
						start: quizDetails.scheduledFor,
						id: enrollQuizId,
						timeStarted: Date.now(),
						restartStatus: quizDetails.quizRestart,
					},
				}}
			/>
		);
	} else {
		return (
			<div className="quizzes-section">
				<div className="quiz-btn-section">
					{userType === "user" ? (
						<Button className="join-quiz-btn" onClick={onJoinClick}>
							<Check />
							Join a Quiz
						</Button>
					) : null}
					{userType === "admin" ? (
						<Button
							className="create-quiz-btn"
							component={Link}
							to="/createQuiz"
						>
							<Add />
							Create a quiz
						</Button>
					) : null}
				</div>
				{userType === "user" ? (
					<div className="enrolled-list">
						<Typography variant="h5" className="up-quizzes">
							Enrolled Quizzes
						</Typography>
						{quizzesEnrolled.length === 0 ? (
							<p style={{ textAlign: "center" }}>
								Sorry! No quizzes available at the moment!
							</p>
						) : (
							<div className="quiz-list root1">
								<GridList
									cols={getCols()}
									className="grid-list btn-set"
								>
									{quizzesEnrolled.map((quiz) => (
										<GridListTile
											key={quiz._id}
											className="quiz-tile"
										>
											<img src="../quiz.png" />
											<GridListTileBar
												title={quiz.quizId.quizName}
												actionIcon={
													<div className="inline">
														<Tooltip title="Start Quiz">
															<IconButton
																aria-label={`start ${quiz.quizId.quizName}`}
																onClick={() =>
																	handleStartButton(
																		quiz
																	)
																}
															>
																<PlayCircleFilled className="enroll-icon" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Info">
															<IconButton
																aria-label={`info ${quiz.quizId.quizName}`}
																onClick={() =>
																	handleInfoButton(
																		quiz
																	)
																}
															>
																<Info className="enroll-icon" />
															</IconButton>
														</Tooltip>
													</div>
												}
											/>
										</GridListTile>
									))}
								</GridList>
							</div>
						)}
					</div>
				) : null}
				<Typography variant="h5" className="up-quizzes">
					Upcoming Quizzes
				</Typography>
				{quizzes.length === 0 ? (
					<p style={{ textAlign: "center" }}>
						Sorry! No quizzes available at the moment!
					</p>
				) : (
					<div className="quiz-list root1">
						<GridList cols={getCols()} className="grid-list">
							{quizzes.map((quiz) => (
								<GridListTile
									key={quiz._id}
									className="quiz-tile"
								>
									<img src="../quiz.png" />
									<GridListTileBar
										title={quiz.quizName}
										subtitle={`By: ${quiz.adminId.name}`}
										actionIcon={
											userType === "user" ? (
												<Tooltip title="Enroll">
													<IconButton
														aria-label={`enroll ${quiz.quizName}`}
														onClick={() =>
															handleEnrollButton(
																quiz
															)
														}
													>
														<Check className="enroll-icon" />
													</IconButton>
												</Tooltip>
											) : null
										}
									/>
								</GridListTile>
							))}
						</GridList>
					</div>
				)}
				<Dialog
					open={joinModal}
					onClose={onCloseHandle}
					aria-labelledby="join-quiz-modal"
					PaperProps={{
						style: {
							backgroundColor: "white",
							color: "#333",
							minWidth: "30%",
						},
					}}
					style={{ width: "100%" }}
				>
					<div className="modal-info">
						{userType === "admin" ? (
							<Typography
								variant="h6"
								className="type-head join-sub"
							>
								Organizers cannot enroll in quizzes.
							</Typography>
						) : (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
								}}
							>
								<Typography variant="h5" className="type-head">
									JOIN A PRIVATE QUIZ
								</Typography>
								<Typography
									variant="h6"
									className="type-head join-sub"
								>
									Enter the code of the quiz you want to join
								</Typography>
								<TextInput
									error={quizCodeError}
									helperText={
										quizCodeError ? "Required" : null
									}
									label="Quiz Code"
									variant="outlined"
									value={quizCode}
									onChange={handleJoinChange}
									className="quiz-code-field"
								/>
								<Button
									className="join-quiz-btn join-modal-btn"
									onClick={handleJoinSubmit}
								>
									Join!
								</Button>
							</div>
						)}
					</div>
				</Dialog>
				<Dialog
					open={enrollModal}
					onClose={onCloseHandle}
					aria-labelledby="enroll-quiz-modal"
					PaperProps={{
						style: {
							backgroundColor: "white",
							color: "#333",
							minWidth: "30%",
						},
					}}
					style={{ width: "100%" }}
				>
					<div className="modal-info">
						{userType === "admin" ? (
							<Typography
								variant="h6"
								className="type-head join-sub"
							>
								Organizers cannot enroll in quizzes.
							</Typography>
						) : (
							<div>
								<Typography
									variant="h6"
									className="type-head join-sub"
								>{`Are you sure you want to join ${enrollQuizName}?`}</Typography>
								<div className="btn-div m-top">
									{/* classes in Navbar.css */}
									<Button
										className="logout-btn m-right"
										onClick={handleEnroll}
									>
										Yes
									</Button>
									<Button
										className="cancel-btn m-left"
										onClick={onCloseHandle}
									>
										No
									</Button>
								</div>
							</div>
						)}
					</div>
				</Dialog>
				<Dialog
					open={startModal}
					onClose={onCloseHandle}
					aria-labelledby="start-quiz-modal"
					PaperProps={{
						style: {
							backgroundColor: "white",
							color: "#333",
							minWidth: "30%",
						},
					}}
					style={{ width: "100%" }}
				>
					<div className="modal-info">
						<div>
							<Typography
								variant="h6"
								className="type-head join-sub"
							>{`Are you sure you want to start ${enrollQuizName}?`}</Typography>
							<div className="btn-div m-top2 start-div">
								{/* classes in Navbar.css */}
								<Button
									className="logout-btn m-right"
									onClick={handleQuizStart}
								>
									Yes
								</Button>
								<Button
									className="cancel-btn m-left"
									onClick={onCloseHandle}
								>
									No
								</Button>
							</div>
						</div>
					</div>
				</Dialog>
				<Dialog
					open={infoModal}
					onClose={onCloseHandle}
					aria-labelledby="info-quiz-modal"
					PaperProps={{
						style: {
							backgroundColor: "white",
							color: "#333",
							minWidth: getInfoWidth(),
							maxHeight: "45%",
						},
					}}
					style={{ width: "100%" }}
				>
					<DialogTitle
						style={{ textAlign: "center", fontWeight: "bold" }}
					>
						Quiz Info
					</DialogTitle>

					{/* From the profile section */}
					{infoLoading ? (
						<Loading />
					) : (
						<div
							className="modal-info no-p-top"
							style={{ textAlign: "center" }}
						>
							<Typography
								variant="h6"
								className="profile-param info-param"
							>
								Name:{" "}
								<span className="profile-data">
									{currQuiz.quizName}
								</span>
							</Typography>
							<Typography
								variant="h6"
								className="profile-param info-param"
							>
								Date:{" "}
								<span className="profile-data">
									{new Date(
										Number(currQuiz.scheduledFor)
									).toDateString()}
								</span>
							</Typography>
							<Typography
								variant="h6"
								className="profile-param info-param"
							>
								Time:{" "}
								<span className="profile-data">
									{new Date(
										Number(currQuiz.scheduledFor)
									).toLocaleTimeString()}
								</span>
							</Typography>
							<div className="time-sec">
								<Typography
									variant="h6"
									className="profile-param info-param"
								>
									<span className="profile-data time-rem">
										{timeRemain}
									</span>
								</Typography>
							</div>
							<Button
								className="unenroll-btn"
								onClick={handleUnenroll}
							>
								<Block style={{ color: "white" }} />
								Unenroll
							</Button>
						</div>
					)}
				</Dialog>
				<Snackbar
					open={snackbar}
					autoHideDuration={2000}
					onClose={() => setSnackBar(false)}
				>
					<Alert
						variant="filled"
						severity="success"
						onClose={() => setSnackBar(false)}
					>
						Successfully Enrolled!
					</Alert>
				</Snackbar>
				<Snackbar
					open={errorSnack}
					autoHideDuration={2000}
					onClose={() => setErrorSnack(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setErrorSnack(false)}
					>
						There was some error. Please try again!
					</Alert>
				</Snackbar>
				<Snackbar
					open={enrollSnack}
					autoHideDuration={5000}
					onClose={() => setEnrollSnack(false)}
				>
					<Alert
						variant="filled"
						severity="info"
						onClose={() => setErrorSnack(false)}
					>
						Processing... Please Wait!
					</Alert>
				</Snackbar>
				<Snackbar
					open={earlyError}
					autoHideDuration={5000}
					onClose={() => setEarlyError(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setEarlyError(false)}
					>
						The quiz has not yet started!
					</Alert>
				</Snackbar>
				<Snackbar
					open={lateError}
					autoHideDuration={5000}
					onClose={() => setLateError(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setLateError(false)}
					>
						This quiz has ended!
					</Alert>
				</Snackbar>
				<Snackbar
					open={givenSnack}
					autoHideDuration={5000}
					onClose={() => setGivenSnack(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setGivenSnack(false)}
					>
						Already given this quiz!
					</Alert>
				</Snackbar>
				<Snackbar
					open={privateWrongCode}
					autoHideDuration={5000}
					onClose={() => setPrivateWrongCode(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setPrivateWrongCode(false)}
					>
						This quiz code does not exists!
					</Alert>
				</Snackbar>
				<Snackbar
					open={alreadyEnrolled}
					autoHideDuration={5000}
					onClose={() => setAlreadyEnrolled(false)}
				>
					<Alert
						variant="filled"
						severity="error"
						onClose={() => setAlreadyEnrolled(false)}
					>
						Already enrolled in this quiz!
					</Alert>
				</Snackbar>
			</div>
		);
	}
	

}



export default withWidth()(QuizzesSection);
