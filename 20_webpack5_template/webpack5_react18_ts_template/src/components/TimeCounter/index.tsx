import React from 'react'
import { flushSync } from 'react-dom'
class TimeCounter extends React.Component<any, any> {
	constructor(props: any) {
		super(props)
		this.state = {
			number: 0,
		}
	}
	handerClick = () => {
		for (let i = 0; i < 5; i++) {
			setTimeout(() => {
				flushSync(() => {
					this.setState({ number: this.state.number + 1 })
				})
				console.log(this.state.number)
			}, 1000)
		}
	}

	render() {
		return (
			<div>
				<button onClick={this.handerClick}>num++</button>
			</div>
		)
	}
}

export default TimeCounter
