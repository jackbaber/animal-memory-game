import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import classNames from 'classnames';
import Modal from 'react-modal';

//Sounds 
const horse = new Audio('./sounds/horse.wav') 
const cow = new Audio('./sounds/cow.wav')
const pig = new Audio('./sounds/pig.wav')
const sheep = new Audio('./sounds/sheep.wav')
const correctSound = new Audio('./sounds/correct.wav')
const wrongSound = new Audio('./sounds/wrong.mp3')

//Helper functions 
Array.prototype.delayedForEach = function(callback, timeout, thisArg, done){
    var i = 0,
        l = this.length,
        self = this;

    var caller = function() {
        callback.call(thisArg || self, self[i], i, self);
        if(++i < l) {
            setTimeout(caller, timeout);
        } else if(done) {
            setTimeout(done, timeout);
        }
    };

    caller();
};



class App extends React.Component{
    state = {
        powerOn: false,
        memory: [],
        gameIsRunning: false,
        playerTurn: false,
        animalChosen: 0,
        animalClicked: 0,
        counter: 0,
        replay: false,
        victory: false,
        wrong: false,
        strict: false,
    }
    handlePowerClick = () => {
        if(this.state.powerOn){
            this.setState({ 
                powerOn: false,
                memory: [],
                gameIsRunning: false,
                playerTurn: false,
                animalChosen: 0,
                animalClicked: 0,
                counter: 0,
                replay: false,
                victory: false,
                wrong: false,
                strict: false,
            })
        } else {
            this.setState({ powerOn: true })
        }
    }
    handleStartClick = (event) => {
        if(!this.state.gameIsRunning && this.state.powerOn) {
            this.setState({
                powerOn: true,
                memory: [], 
                gameIsRunning: true,
                playerTurn: false,
                animalChosen: 0,
                animalClicked: 0,
                counter: 0,
                replay: false, 
                victory: false,
                wrong: false,
            }, this.computerTurn)
        }
    }

    handleStrictClick = (event) => {
        if(!this.state.gameIsRunning && this.state.powerOn){
            if(this.state.strict){
                this.setState({ strict: false })
            } else {
                this.setState({ strict: true })
            }
        }
    }

    handleAnimalClick = (event) => {
        if(this.state.playerTurn){
            let choice = Number(event.currentTarget.children[0].id)
            this.checkCorrect(choice)
            this.setState({ animalClicked: choice})
            setTimeout(() => this.setState({ animalClicked: 0 }), 350)
        }
    }

    checkCorrect = (choice) => {
        const { counter, memory, playerTurn } = this.state;

        if(choice === memory[counter]) {
            console.log("correct")
            correctSound.play();
            let newCounter = counter + 1;
            this.setState({
                counter: newCounter,
            }, function(){
                console.log("updated ", this.state.counter)
                console.log(memory.length)

                if(memory.length == this.state.counter) {
                    if(memory.length == 5){
                        this.setState({
                            victory: true,
                            gameIsRunning: false,
                            animalChosen: 0,
                            playerTurn: false,
                        })

                    } else {
                        console.log("running")
                        this.setState({
                            playerTurn: false,
                            counter: 0,
                            replay: false,
                        }, this.computerTurn)
                    }
                    
                } else {
                    console.log("returning")
                    return;
                }
            })
        
          
        } else {
            console.log("wrong")
            wrongSound.play();
            if(this.state.strict){
                this.setState({ gameIsRunning: false }, this.handleStartClick)
            } else {
                this.setState({
                    playerTurn: false,
                    replay: true,
                    counter: 0,
                    wrong: true,
                }, function(){
                    console.log(this.state.wrong)
                    setTimeout(() => this.setState({ wrong: false, }, this.computerTurn), 1000)
                })
            }
        }
    }
            
    computerTurn = () => {
        const { memory, replay } = this.state

        //if it is a replay, computer should only repeat the items from memory and then switch to playerTurn upon completion
        if(replay) {
            setTimeout(() => {
                memory.delayedForEach((item) => {
                    this.runDisplayAnimation(item)
                }, 2000, null, () => {
                    this.setState({
                        playerTurn: true,
                    })
                });
            }, 3000)
        } 
        // else, computer should repeat items from memory and then carry out its next random selection
        else {
            setTimeout(() => {
                memory.delayedForEach((item) => {
                    this.runDisplayAnimation(item)
                }, 2000, null, () => {
                    this.computerNextTurn()
                })
            }, 3000)
        }
    } 

    computerNextTurn = () => {
        const { counter, memory } = this.state;
        let choice = Math.floor(Math.random() * 4) + 1
        this.setState({ 
            playerTurn: true,
            memory: [...memory].concat(choice),
        }, () => {
            this.runDisplayAnimation(choice)
        })
    }

    runDisplayAnimation = (choice) => {
        this.setState({ animalChosen: choice })
        setTimeout(() => this.setState({ animalChosen: 0 }), 1000)

        if(choice === 4){
            horse.currentTime=0
            horse.play()
        } else if (choice === 1) {
            cow.currentTime=0
            cow.play()
        } else if (choice === 2) {
            pig.currentTime=0
            pig.play()
        } else if (choice === 3) {
            sheep.currentTime=0
            sheep.play()
        }
    }
     
    render(){
        return ( 
            <div>
                <div className="flex flex-wrap justify-center">
                    <GameControls
                        onClick={this.handleStartClick}
                        onStrictClick={this.handleStrictClick}
                        onPowerClick={this.handlePowerClick}
                        gameIsRunning={this.state.gameIsRunning}
                        memory={this.state.memory}
                        strictOn={this.state.strict}
                        powerOn={this.state.powerOn}
                    />
                </div>
                <div className="flex flex-wrap justify-center items-center">
                    <GameBoard 
                        animalChosen={this.state.animalChosen}
                        animalClicked={this.state.animalClicked}
                        onClick={this.handleAnimalClick}
                        wrong={this.state.wrong}
                        victory={this.state.victory}
                    />
                </div>
                <VictoryModal
                    onClick={this.handleStartClick}
                    victory={this.state.victory}
                />
                    
                  

            </div>
            
        )
    }
}

class GameBoard extends React.Component{
    createGameSquare = (type) => {
        return (
            <GameSquare
                type={type}
                animalChosen={this.props.animalChosen}
                animalClicked={this.props.animalClicked}
                onClick={this.props.onClick}
                victory={this.props.victory}
                wrong={this.props.wrong}
            />
        )

    }
    render(){
        const { wrong } = this.props
        let boardClass = classNames({
            "flex flex-wrap w-60 vh-75 justify-around items-center shadow-1 pa4 br4 mb7": true,
        })
        return (
            <div className={boardClass}
            >
                {this.createGameSquare(1)}
                {this.createGameSquare(2)}
                {this.createGameSquare(3)}
                {this.createGameSquare(4)}
            </div>
        )
    }
}

class GameSquare extends React.Component{
  
    render(){
        const { animalChosen, animalClicked, type, victory, wrong } = this.props

        let squareClasses = classNames({
            "flex items-center justify-center w-50 h-50 br4 pa2 pointer": true,
            "ba b--dashed bw3 b--dark-red": (!!wrong) && (animalClicked === type),
            "o-80": animalClicked === type,
            "bg-light-pink": type === 2,
            "bg-light-blue": type === 3
        })

        let imageClasses = classNames({
            "animated infinite wobble": animalChosen === type && type === 1,
            "animated infinite bounce": (animalChosen === type && type === 2) || (!!victory),
            "animated infinite shake": animalChosen === type && type === 3,
            "animated infinite flipOutX": animalChosen === type && type === 4, 
        })

        if(type === 1){
            return (
                <div 
                    className={squareClasses}  
                    onClick={this.props.onClick}
                    style={{backgroundColor: "#9E889C"}}
                   >
                <img 
                    id={type} 
                    src={require('../public/images/cow.png')} 
                    style={{ maxWidth: "50%" }} 
                    className={imageClasses} />
                </div>
            )
        } else if (type === 2){
            return (
                <div 
                    className={squareClasses}
                    onClick={this.props.onClick}> 
                    <img 
                        id={type} 
                        src={require('../public/images/pig.png')} 
                        style={{ maxWidth: "50%" }} 
                        className={imageClasses} 
                    />
                </div>
            )
        } else if (type === 3){
            return (
                <div 
                    className={squareClasses}
                    onClick={this.props.onClick}>
                    <img 
                        id={type} 
                        src={require('../public/images/sheep.png')} 
                        style={{ maxWidth: "50%" }} 
                        className={imageClasses}
                    />
                </div>
            )
        } else if (type === 4){
            return (
                <div 
                    className={squareClasses}
                    onClick={this.props.onClick}
                    style={{backgroundColor: "#43525D"}}>
                    <img 
                        id={type}
                        src={require('../public/images/horse.png')} 
                        style={{ maxWidth: "50%" }} 
                        className={imageClasses} 
                    />
                </div>
            )
        }
    }
}

const GameControls = (props) => {

    let startButtonStyle = classNames({
        "br-100 bw3 ba b--light-gray h4 w4 dib bg-moon-gray": true,
        "bg-yellow": props.gameIsRunning,
        "pointer grow": !props.gameIsRunning && props.powerOn
    })
     
    let strictButtonStyle = classNames({
        "br-100 bw3 ba b--light-gray h4 w4 dib bg-moon-gray": true,
        "bg-red": props.strictOn,
        "pointer grow": !props.gameIsRunning && props.powerOn
    })

    let powerButtonStyle = classNames({
        "br-100 bw3 ba b--light-gray h4 w4 dib bg-moon-gray": true,
        "bg-green": props.powerOn,
        "pointer grow": !props.gameIsRunning,
    })

    return (
            <div className="tc flex justify-between items-center mt5 bw3 br-pill w-20 mb3">
                <div>
                    <div 
                        className={powerButtonStyle}
                        onClick={props.onPowerClick}
                        >
                    </div>
                    <h1 className="f3 gray mt0">On</h1>
                </div>
                <div>
                    <div 
                        className={strictButtonStyle}
                        onClick={props.onStrictClick}
                    ></div>
                    <h1 className="f3 gray mt0">Strict</h1>
                </div>

                <div>
                    <div 
                        className={startButtonStyle}
                        onClick={props.onClick}
                    ></div>
                    <h1 className="f3 gray mt0">Start</h1>
                </div>
                
                <div>
                    <div className="br-pill bw2 ba b--light-gray h3 w4 dib pa3 gray">{props.memory.length}</div>
                    <h1 className="f3 gray mt0">Turn</h1>
                </div>
                
            </div>
    )
}

const VictoryModal = (props) => (
    <Modal
        isOpen={!!props.victory}
        onRequestClose={props.onClick}
        contentLabel="victory"
        closeTimeoutMS={200}
        className="modal"
        >
        <div>
            <h1 className="animated zoomInLeft f-headline lh-solid">You win!</h1>
            <button 
                onClick={props.onClick}
                className="modal-button f1 lh-title link grow ba bw2 br-pill ph5 pv3 mb2 dib white i w-100"
            >Play again</button>
        </div>
       
    </Modal>
);

ReactDOM.render(<App/>, document.getElementById('app'));


