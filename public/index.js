// Select elements here
const video = document.getElementById('video');
const videoControls = document.getElementById('video-controls');
const playButton = document.getElementById('play');
const playbackIcons = document.querySelectorAll('.playback-icons use');
const timeElapsed = document.getElementById('time-elapsed');
const duration = document.getElementById('duration');
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');
const seekTooltip = document.getElementById('seek-tooltip');
const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.getElementById('volume');
const playbackAnimation = document.getElementById('playback-animation');
const fullscreenButton = document.getElementById('fullscreen-button');
const videoContainer = document.getElementById('video-container');
const fullscreenIcons = fullscreenButton.querySelectorAll('use');

// Socket io
const socket = io();

// A User has Left
socket.on('left',(msg) =>{
  console.log(msg)
})


// Add eventlisteners here
playButton.addEventListener('click', togglePlay);
video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);
video.addEventListener('loadedmetadata', initializeVideo);
video.addEventListener('timeupdate', updateTimeElapsed);
video.addEventListener('timeupdate', updateProgress);
seek.addEventListener('mousemove', updateSeekTooltip);
seek.addEventListener('input', skipAhead);
volume.addEventListener('input', updateVolume);
video.addEventListener('volumechange', updateVolumeIcon);
volumeButton.addEventListener('click', toggleMute);
video.addEventListener('click', togglePlay);
video.addEventListener('click', animatePlayback);
videoContainer.addEventListener('fullscreenchange', updateFullscreenButton);


// Disale the default icons
const videoWorks = !!document.createElement('video').canPlayType;
if (videoWorks) {
  video.controls = false;
  videoControls.classList.remove('hidden');
}


//Toggles video is played or paused
function togglePlay() {
  socket.on('status',(msg) =>{
      if(msg == 'played'){
       video.play()  
      }else{
      video.pause()
      }
  })
    if (video.paused || video.ended) {
      // video.play()  
      // console.log('played')
      socket.emit('status','played')
    } else {
      // video.pause()
      // console.log('paused')
      socket.emit('status','paused')
    }
  }
  

// Play or pause update button  - depends on the video toggle
function updatePlayButton() {
    playbackIcons
    .forEach(icon => icon.classList.toggle('hidden'));

    //   Tooltip Hover
    if (video.paused) {
        playButton.setAttribute('data-title', 'Play (k)')
      } else {
        playButton.setAttribute('data-title', 'Pause (k)')

      }
  }

//   Format Time seconds - minutes
function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  
    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    };
  };

//   Sets the video duration 
function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
  }
  
  
  // time the video is been played
function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)

    // the full length of thre time  ( duration) , thr current time of the video
    // console.log(video.duration)
    // console.log(video.currentTime)
  }
  

//   Update the progress bar - duration
function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    seek.setAttribute('max', videoDuration);
    progressBar.setAttribute('max', videoDuration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
  }
  
//   Upadte progress bar - current time
function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
  }
  
// the skip progress bar (red)
function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    seek.setAttribute('data-seek', skipTo)
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;
  }

  // the progress bar is clicked
function skipAhead(event) {
 
    const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
    

    // syncing the progress bar
    socket.emit('currentTime',skipTo) 

    console.log(skipTo)

    socket.on('currentTime',(msg) =>{
      video.currentTime = msg;
      progressBar.value = msg;
      seek.value = msg;
    })
  }

  // and disables the muted state if active
function updateVolume() {
    if (video.muted) {
      video.muted = false;
    }
    socket.on('volume',(msg) =>{
      video.volume = msg;
    })
    
    // Send the value of volume to the server
    socket.emit('volume',volume.value)
  }



  // the volume of the video
function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
      icon.classList.add('hidden');
    });
  
    volumeButton.setAttribute('data-title', 'Mute (m)')
  
    if (video.muted || video.volume === 0) {
      volumeMute.classList.remove('hidden');
      volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (video.volume > 0 && video.volume <= 0.5) {
      volumeLow.classList.remove('hidden');
    } else {
      volumeHigh.classList.remove('hidden');
    }
  }

  // it was set to before the video was muted
function toggleMute() {
    video.muted = !video.muted;
  
    if (video.muted) {
      volume.setAttribute('data-volume', volume.value);
      volume.value = 0;
    } else {
      volume.value = volume.dataset.volume;
    }
  }

  // the video is played or paused
function animatePlayback() {
    playbackAnimation.animate([
      {
        opacity: 1,
        transform: "scale(1)",
      },
      {
        opacity: 0,
        transform: "scale(1.3)",
      }], {
      duration: 500,
    });
  }

  // then it should exit and vice versa.
function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      // Need this to support Safari
      document.webkitExitFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
      // Need this to support Safari
      videoContainer.webkitRequestFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  }

//   Toggle thr fullscreen
  fullscreenButton.onclick = toggleFullScreen;

  // and tooltip to reflect the current full screen state of the video
function updateFullscreenButton() {
  fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));

  if (document.fullscreenElement) {
    fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')

  } else {
    fullscreenButton.setAttribute('data-title', 'Full screen (f)')
  }
}