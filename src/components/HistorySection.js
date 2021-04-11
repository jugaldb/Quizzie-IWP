import React, { useState, useEffect } from "react";
import './HistorySection.css';
import { GridList, GridListTile, GridListTileBar, Tooltip, IconButton, isWidthUp, withWidth, List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { Check, Create, Settings, ArrowForwardIos } from "@material-ui/icons";
import axios from "axios";
import QuizLoading from "./QuizLoading";
import { Link } from "react-router-dom";

function HistorySection(props) {
	const [userType, setUserType] = useState(props.type);
	const [profile, setProfile] = useState(props.profile);
	const [quizzes, setQuizzes] = useState([]);

	const [loading, setLoading] = useState(false);

	const getCols = () => {
		if (isWidthUp('md', props.width)) {
			return 3;
		}

		return 2;
	}

	useEffect(()=>{
		setQuizzes([
			{
				 "_id":"607041a052ab540017bc2f56",
				 "quizId":"607041a052ab540017bc2f55",
				 "marks":2
			},
			{
				 "_id":"60705b05087268001723c7a0",
				 "quizId":"60705b05087268001723c79f",
				 "marks":10
			}
	 ])
	},[])
	if (loading) {
		return (
			<QuizLoading />
		)
	}
	else if (userType === "admin") {
		return (
			<div className="history-section">
				{quizzes.length === 0 ?
					<p style={{ textAlign: 'center' }}>You have not created any quizzes yet!</p>
					:
					<GridList cols={getCols()} className="grid-list">
						{quizzes.map((quiz) => (
							<GridListTile key={quiz._id} className="quiz-tile">
								<img src="../quiz.png" />
								<GridListTileBar
									title={quiz.quizName}
									subtitle={`By: You`}
									actionIcon={
										<Tooltip title="Settings">
											<IconButton aria-label={`edit ${quiz.quizName}`}
												component={Link} to={`/editQuiz/${quiz._id}`}>
												<Settings className="enroll-icon" />
											</IconButton>
										</Tooltip>
									}
								/>
							</GridListTile>
						))}
					</GridList>
				}
			</div>
		)
	}
	else {
		return (
			<div className="history-section">
				{profile.quizzesGiven.length === 0 ?
					<p style={{ textAlign: 'center' }}>You have not given any quizzes yet!</p>
					: <List aria-label="quiz display" className="owner-quiz-list">
						{quizzes.map(quiz => (
							quiz.quizId !== null?
								(<ListItem button className="owner-quiz-item" key={quiz._id}>
									<ListItemText primary={quiz.quizId.quizName} secondary={`Scored: ${quiz.marks}`} />
									<ListItemSecondaryAction>
										<IconButton edge="end" aria-label="details" >
											<ArrowForwardIos />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>): null
						))}
					</List>}
			</div>
		)
	}
}

export default withWidth()(HistorySection);