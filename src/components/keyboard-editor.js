/**
 * FYI: This is a demo for class components
 * To use simple-keyboard with React Hooks / Function components, check out:
 * https://simple-keyboard.com/react/demo/hooks
 */
import { Box } from '@mui/material';
import React, { Component } from 'react';
import { render } from 'react-dom';
import Keyboard from 'react-simple-keyboard';

// Instead of the default import, you can also use this:
// import { KeyboardReact as Keyboard } from "react-simple-keyboard"

import 'react-simple-keyboard/build/css/index.css';

class KeyBoardEditor extends Component {
  state = {
    layoutName: 'default',
    input: '',
  };

  onChange = (input) => {
    this.setState({ input });
    console.log('Input changed', input);
  };

  // onKeyPress = (button) => {
  //   console.log('Button pressed', button);

  //   /**
  //    * If you want to handle the shift and caps lock buttons
  //    */
  //   if (button === '{shift}' || button === '{lock}') this.handleShift();
  // };

  // handleShift = () => {
  //   const layoutName = this.state.layoutName;

  //   this.setState({
  //     layoutName: layoutName === 'default' ? 'shift' : 'default',
  //   });
  // };

  // handleCaps = () => {
  //   const layoutName = this.state.layoutName;

  //   this.setState({
  //     layoutName: layoutName === 'default' ? 'caps' : 'default',
  //   });
  // };

  onKeyPress = button => {
    console.log("Button pressed", button);

    /**
     * Shift functionality
     */
    if (button === "{shift}") this.handleShift();

    /**
     * Caps functionality
     */
    if (button === "{lock}") this.handleCaps();
  };

  handleShift = () => {
    let layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "shift" ? "default" : "shift"
    });
  };

  handleCaps = () => {
    let layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "caps" ? "default" : "caps"
    });
  };

  onChangeInput = (event) => {
    const input = event.target.value;
    this.setState({ input });
    this.keyboard?.setInput(input);
  };

  render() {
    return (
      <Box className="keyboard-editor-wrapper">
        {/* <Box className="kb-textInput">
          <textarea
            value={this.state.input}
            placeholder={'Tap on the virtual keyboard to start'}
            onChange={this.onChangeInput}
          ></textarea>
        </Box> */}
        <Keyboard
          keyboardRef={(r) => (this.keyboard = r)}
          layoutName={this.state.layoutName}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
        />
      </Box>
    );
  }
}

export default KeyBoardEditor;
