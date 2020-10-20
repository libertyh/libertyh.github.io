window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null,
    audioInput = null,
    effectInput = null, 
    currentEffectNode = null,
    dtime = null,
    dregen = null,
    ngGate = null,
    rafID = null,
    analyser1 = null,
    analyserView1 = null;

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function createLPInputFilter(output) {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
}


function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    createLPInputFilter(audioInput);
    lpInputFilter.connect(dryGain);
    lpInputFilter.connect(analyser1);
    lpInputFilter.connect(effectInput);
}

var useFeedbackReduction = true;

function gotStream(stream) {
    var input = audioContext.createMediaStreamSource(stream);

    audioInput = convertToMono( input );

    if (useFeedbackReduction) {
        audioInput.connect( createLPInputFilter() );
        audioInput = lpInputFilter;
        
    }
    // create mix gain nodes
    outputMix = audioContext.createGain();
    dryGain = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    audioInput.connect(analyser1);
    audioInput.connect(effectInput);
    dryGain.connect(outputMix);
    wetGain.connect(outputMix);
    outputMix.connect( audioContext.destination);
    outputMix.connect(analyser2);
    crossfade(1.0);
    changeEffect();
}

function initAudio() {
    audioContext = new AudioContext();
    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 1024;
    analyser2 = audioContext.createAnalyser();
    analyser2.fftSize = 1024; 
    
    if (!navigator.getUserMedia)
        return(alert("Error: getUserMedia not supported!"));

    if (navigator.mozGetUserMedia === "undefined") {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            gotStream(stream);
        })
        .catch(function(err) {
            console.log(e);
            alert("Error getting audio.");
        });
        console.log("'getUserMeida' re-assigned for Mozilla.");
    } else {
        navigator.getUserMedia({audio:true}, gotStream, function(e) {
            console.log(e);
            alert("Error getting audio.");
        });
    }

}

function crossfade(value) {
// equal-power crossfade
var gain1 = Math.cos(value * 0.5*Math.PI);
var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

dryGain.gain.value = gain1;
wetGain.gain.value = gain2;
}

function changeEffect() {
    dtime = null;
    dregen = null;

    if (currentEffectNode) 
        currentEffectNode.disconnect();
    if (effectInput)
        effectInput.disconnect();

    currentEffectNode = createDelay();
            
    audioInput.connect( currentEffectNode );
}

function createDelay() {
    var delayNode = null;
    
    if (window.location.search.substring(1) == "webkit")
        delayNode = audioContext.createDelay();
    else
        delayNode = audioContext.createDelay();
    
    delayNode.delayTime.value = parseFloat( .21 );
    dtime = delayNode;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    dregen = gainNode;

    gainNode.connect( delayNode );
    delayNode.connect( gainNode );
    delayNode.connect( wetGain );

    return delayNode;
}