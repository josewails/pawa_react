/*
 *
 * Home
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import FacebookLogin from 'react-facebook-login';
import SendIcon from 'react-icons/lib/fa/paper-plane';


const json = require('../../data/story.json');
const axios = require('axios');
const base_url = 'https://13d6f5ca.ngrok.io'

import './style.css';
import './styleM.css';

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props);
    let _this = this;
    this.state = {
      siteAvatar:"http://avatar.technopathic.me/cat-avatar-generator.php?seed=pawa",
      userAvatar:"",
      data:"",
      blocks:[],
      activeBlock:0,
      pause:false,
      isLoading:true
    }

    this.responseFacebook = this.responseFacebook.bind(this);
    this.addBlock = this.addBlock.bind(this);

  }

  componentWillMount() {
    this.generateAvatar();
    this.getData();
  }

  componentDidMount() {
    this.setActive();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  responseFacebook = (response) => {

    let  _this = this;

    console.log(base_url + '/api/create_facebook_user');

    const options ={
      method: 'POST',
      url: base_url + '/api/create_facebook_user',
      data: response
    }

    axios(options).then(function(res){

        const opts = {
          data: {
            'facebook_id': response.id
          },
          method: 'POST',
          url: base_url + '/api/get_groups_data'
        }

        axios(opts).then(function(res){
            _this.addBlock(res.data, 'options');
            _this.setState(
              {
                pause: false
              }
            )
        }).catch(function(err){
          console.log(err);
        });
      
    }).catch(function(err){
      console.log(err);
    });
  }
  
  handleInput = (i, event) => {
    let blocks = this.state.blocks;
    blocks[i].storage = event.target.value;

    this.setState({
      blocks:blocks
    }, function() {
      this.forceUpdate();
    })
  }

  getData = () => {
    this.setState({
      data:json
    }, function() {
      this.setState({
        isLoading:false
      })
    })
  }

  generateAvatar = () => {
    let string = Math.random().toString(36).substr(2, 5);
    this.setState({
      userAvatar:"http://avatar.technopathic.me/cat-avatar-generator.php?seed="+string
    })
  }

  setBot = () => {
    let _this = this;
    let data = this.state.data;
  }

  setActive = () => {
    let _this = this;
    let data = this.state.data;
    let blocks = this.state.blocks;
    let pause = this.state.pause;
    let activeBlock = this.state.activeBlock;

    for(let i = activeBlock; i < data.length; i++) {
      (function (i) {
        if(_this.state.blocks[_this.state.blocks.length - 1] === undefined || _this.state.blocks[_this.state.blocks.length - 1].bot === true) {
          setTimeout(function () {
            if(pause === false) {
              data[i].bot = true;
              data[i].loading = true
              blocks.push(data[i]);
              if(data[i].type === "option" || data[i].type === "input") {
                pause = true;
                data[i].showOptions = true;
                data[i].storage = "";
              }
              _this.setState({
                blocks:blocks,
                pause:pause,
                activeBlock:i + 1
              }, function() {
                _this.forceUpdate();
                setTimeout(function () {
                  let newBlocks = _this.state.blocks;
                  newBlocks[newBlocks.length - 1].loading = false;
                  _this.setState({
                    blocks:newBlocks
                  }, function() {
                    _this.forceUpdate();
                  })
                }, 400);
              })
            }
          }, 550*i);
        }
        else {
          setTimeout(function () {
            if(pause === false) {
              data[i].bot = true;
              data[i].loading = true;
              blocks.push(data[i]);
              if(data[i].type === "option" || data[i].type === "input") {
                pause = true;
                data[i].showOptions = true;
                data[i].storage = "";
              }
              _this.setState({
                blocks:blocks,
                pause:pause,
                activeBlock:i + 1
              }, function() {
                _this.forceUpdate();
                setTimeout(function () {
                  let newBlocks = _this.state.blocks;
                  newBlocks[newBlocks.length - 1].loading = false;
                  _this.setState({
                    blocks:newBlocks
                  }, function() {
                    _this.forceUpdate();
                  })
                }, 400);
              })
            }
          }, 550*i);
        }
      })(i);
    }
  }

  handleEnter = (i, action, event) => {
    if(event.keyCode === 13)
    {
      this.useInput(i, action)
    }
  };

  addBlock = (input, type='text') => {
    let _this = this;
    let blocks = this.state.blocks;
    let item = null;

    if (type === 'text'){
      item = {type:"text", data:input, bot:true, loading:true};
    }

    else  if (type === 'options'){
       item = input;  
    }

    if (item === null){
      return;
    }

    setTimeout(function() {
      blocks.push(item);

      console.log(blocks);

      _this.setState({
        blocks:blocks
      }, function() {
        _this.forceUpdate();
        setTimeout(function () {
          let newBlocks = _this.state.blocks;
          newBlocks[newBlocks.length - 1].loading = false;
          _this.setState({
            blocks:newBlocks
          }, function() {
            _this.forceUpdate();
          })
        }, 500);
      })
    }, 800)

  }

  useAPI = (action) => {
    let _this = this;
    let blocks = this.state.blocks;

    fetch(action, {
      method:'GET'
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      if(json.result) {
        _this.addBlock(json.result);
        _this.setState({
          pause:false,
        }, function() {
          _this.setActive();
        })
      }
      else {
        _this.setState({
          pause:false,
        }, function() {
          _this.setActive();
        })
      }
    }.bind(this))
  }

  useFunction = (text, i, action) => {
    let _this = this;
    let blocks = this.state.blocks;
    let item = {type:"text", data:text, bot:false};
    let func = new Function("_this", "input", action);
    blocks[i].showOptions = false;
    blocks.push(item);

      _this.setState({
        blocks:blocks
      }, function() {
        func(_this, text);
        _this.setState({
          pause:false
        }, function() {
          _this.setActive();
        })
      })

  }

  useInput = (i, action) => {
    let _this = this;
    let blocks = this.state.blocks;
    let text = this.state.blocks[i].storage;
    let item = {type:"text", data:text, bot:false};
    let func = new Function("_this", "input", action);
    blocks[i].showOptions = false;
    blocks.push(item);

    _this.setState({
      blocks:blocks
    }, function() {
      func(_this, text);
      _this.setState({
        pause:false
      }, function() {
        _this.setActive();
      })
    })
  }

  renderOptions = (block, i) => {

    let blockStyle = "chatBlock";
    let chatStyle = "chatLeft";

    if(block.showOptions === true) {
      if(block.options[0].type ==  'link'){
        return(
          <div className="optionsContainer">
            <div className="optionsTitle">{block.title}</div>
            <div className="optionsButtons">
              {block.options.map((option, j) => (
                <div className={chatStyle} key={j}>
                <div className={blockStyle}>
                  <a href={option.data} target="_blank" className="innerBlock">{option.text}</a>
                </div>
              </div>
              ))}
            </div>
          </div>
        )
        
      }else{
        return(
          <div className="optionsContainer">
            <div className="optionsTitle">{block.title}</div>
            <div className="optionsButtons">
              {block.options.map((option, j) => (
                <div className="optionsButton" onClick={() => this.useFunction(option.data, i, option.action)} key={j}>{option.data}</div>
              ))}
            </div>
          </div>
        )

      }
    }
  }

  renderInput = (block, i) => {

    if(block.showOptions === true) {
      let inputOption = <div className="inputOptions"><input className="blockInput" onChange={(event) => this.handleInput(i, event)} value={block.storage} placeholder="Type your Answer here..." onKeyDown={(event)=> this.handleEnter(i, block.action, event) }/><div className="inputButton" onClick={()=>this.useInput(i, block.action)}><SendIcon/></div></div>;
      if(block.multi === true) {
        inputOption = <div className="inputOptions"><textarea className="blockInput" onChange={(event) => this.handleInput(i, event)} placeholder="Type your Answer here..." value={block.storage} onKeyDown={(event)=> this.handleEnter(i, block.action, event) }></textarea><div className="inputButton" onClick={()=>this.useInput(i, block.action)}><SendIcon/></div></div>;
      }
      return inputOption;
    }
  }

  renderAvatar = (block, i) => {
    let chatAvatar = this.state.siteAvatar;
    let blocks = this.state.blocks;
    if(block.bot === false) {
      chatAvatar = this.state.userAvatar;
    }

    if(i !== 0) {
      let previous = blocks[i - 1];
      if(previous.bot !== block.bot) {
        return(
          <img src={chatAvatar} className="chatAvatarImg"/>
        )
      }
    } else {
      return(
        <img src={chatAvatar} className="chatAvatarImg"/>
      )
    }
  }

  renderBlock = (block, i) => {
    let chatStyle = "chatLeft";
    let blockStyle = "chatBlock";

    if(block.bot === false) {
      chatStyle = "chatRight";
      blockStyle = "myBlock";
    }
    if(block.loading === true) {
      return(
        <div className="loadChat" key={i}>
          <div className="chatAvatar">
            {this.renderAvatar(block, i)}
          </div>
          <div className={blockStyle}>
            <div className="loading">
                <div className="line" style={{background:'#23A6D5'}}></div>
                <div className="line" style={{background:'#E73C7E'}}></div>
                <div className="line" style={{background:'#23A6D5'}}></div>
            </div>
          </div>
        </div>
      )
    }
    else {
      if(block.type === "text") {
        return(
          <div className={chatStyle} key={i}>
            <div className="chatAvatar">
              {this.renderAvatar(block, i)}
            </div>
            <div className={blockStyle}>
              <span className="innerBlock">{block.data}</span>
            </div>
          </div>
        )
      }
      else if(block.type === "image") {
        return(
          <div className={chatStyle} key={i}>
            <div className="chatAvatar">
              {this.renderAvatar(block, i)}
            </div>
            <div className={blockStyle}>
              <img src={block.data} className="chatImage" />
            </div>
          </div>
        )
      }
      else if(block.type === "link") {
        return(
          <div className={chatStyle} key={i}>
            <div className="chatAvatar">
              {this.renderAvatar(block, i)}
            </div>
            <div className={blockStyle}>
              <a href={block.data} target="_blank" className="innerBlock">{block.text}</a>
            </div>
          </div>
        )
      } else if(block.type === "option") {
        return(
          <div style={{marginBottom:'10px'}} key={i}>
            <div className={chatStyle}>
              <div className="chatAvatar">
                {this.renderAvatar(block, i)}
              </div>
              <div className={blockStyle}>
                <span className="innerBlock">{block.data}</span>
              </div>
            </div>
            {this.renderOptions(block, i)}
          </div>
        )
      } else if(block.type === "input") {

        return(
          <div style={{marginBottom:'10px'}} key={i}>
            <div className={chatStyle}>
              <div className="chatAvatar">
                {this.renderAvatar(block, i)}
              </div>
              <div className={blockStyle}>
                <span className="innerBlock">{block.data}</span>
              </div>
            </div>
            <div className="optionsContainer">
              <div className="optionsTitle">{block.title}</div>
              {this.renderInput(block, i)}
            </div>
          </div>
        )
      }else if(block.type === 'facebook-login'){

       return (
        
           <div key={i}>
              <FacebookLogin
                appId="191916398164935"
                fields="id,name,email,picture,groups{administrator,name}"
                scope="public_profile,groups_access_member_info,publish_to_groups"
                cssClass="facebook-btn"
                callback={this.responseFacebook}
            />
           </div>
       )
        
      }
    }
  }

  render() {
    if(this.state.isLoading) {
      return (
        <div className="container">
          <Helmet title="Pawa" meta={[ { name: 'description', content: 'Description of Home' }]}/>
          <a href="https://github.com/Technopathic/Stride"><img style={{position:"absolute", top:"0", right:"0", border:"0"}} src="https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67" alt="Login" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png" /></a>
          <header className="headerContainer">
            <div className="headerWrapper">
              <div className="siteName">Pawa</div>
              <div className="siteMenu"></div>
            </div>
          </header>

          <main className="homeMain">
            <div className="homeContent">
              <div className="loading">
                  <div className="line" style={{background:'#23A6D5'}}></div>
                  <div className="line" style={{background:'#E73C7E'}}></div>
                  <div className="line" style={{background:'#23A6D5'}}></div>
              </div>
            </div>
          </main>
          <div style={{ float:"left", clear: "both" }}
            ref={(el) => { this.messagesEnd = el; }}>
          </div>
        </div>
      )
    }
    else {
      return (
        <div className="container">
          <Helmet title="Pawa-Helping admins manage communities" meta={[ { name: 'description', content: 'Description of Home' }]}/>
          <header className="headerContainer">
            <div className="headerWrapper">
              <div className="siteName">Pawa</div>
              <div className="siteMenu"></div>
            </div>
          </header>

          <main className="homeMain">
            <div className="homeContent">
              {this.state.blocks.map((block, i) => (
                this.renderBlock(block, i)
              ))}
            </div>
            <div style={{ float:"left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }}>
            </div>
          </main>

          <footer></footer>
        </div>
      );
    }
  }
}

Home.contextTypes = {
  router: React.PropTypes.object
};
