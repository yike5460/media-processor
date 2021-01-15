import React from 'react';
import Clappr from 'clappr';
import LevelSelector from 'level-selector'


class ClapprWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.playerInstance = new Clappr.Player({ 
      autoPlay: true,
      plugins: {
        core: [LevelSelector]
      },
      levelSelectorConfig: {
        title: '動画品質',
      },
      // chromeless:true,
    })
    this.nodeRef = React.createRef()
  }
  
  componentDidMount() {
    this.playerInstance.attachTo(this.nodeRef.current)
    this.loadSource(this.props.src)
  }
  
  componentWillUnmount() {
    this.playerInstance.destroy()
  }
  
  shouldComponentUpdate(nextProps, _) {
    if (nextProps.src !== this.props.src) {
      this.loadSource(nextProps.src)
    }
    return false
  }
  
  loadSource(src) {
    this.playerInstance.load(src)
  }
  
  render() {
    return <div ref={this.nodeRef} />
  }
}

export default ClapprWrapper;