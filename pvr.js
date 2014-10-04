// canvas要素の取得
var canvas = document.getElementById('canvas');
// WebGLRenderingContextの取得
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// 拡張機能の取得
var ct = gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");

// シェーダの生成
function createShader(gl, id){
    var src = document.getElementById(id);
    if(src === null){
        return null;
    }

    var shader = null;
    switch(src.type){
    case 'x-shader/x-vertex':
        shader = gl.createShader(gl.VERTEX_SHADER);
        break;
    case 'x-shader/x-fragment':
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        break;
    }
    if(shader === null){
        return null;
    }

    gl.shaderSource(shader, src.text);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// シェーダプログラムの生成
function createProgram(gl, vertexId, fragmentId){
    var vertexShader = createShader(gl, vertexId);
    if(vertexShader === null){
        return null;
    }

    var fragmentShader = createShader(gl, fragmentId);
    if(fragmentShader === null){
        gl.deleteShader(vertexShader);
        return null;
    }

    var program = gl.createProgram();
    if(program === null){
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.deleteShader(vertexShader);

    gl.attachShader(program, fragmentShader);
    gl.deleteShader(fragmentShader);

    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// 頂点などのバッファ生成
function createBuffer(gl, target, data, usage){
    var buffer = gl.createBuffer();

    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, usage);
    gl.bindBuffer(target, null);

    return buffer;
}

var program = createProgram(gl, 'vertex', 'fragment');
gl.useProgram(program);

// 画面全体に対応するポリゴンの頂点バッファを生成
var vertices = new Float32Array([
    -1, 1,
     1, 1,
     1, -1,

    -1, 1,
     1, -1,
    -1, -1,
]);
var vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
var position = gl.getAttribLocation(program, 'position');
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(position);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

// 画面全体に対応するポリゴンのUV座標バッファを生成
var uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,

    0, 0,
    1, 1,
    0, 1,
]);
var uvsBuffer = createBuffer(gl, gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
var texcoord = gl.getAttribLocation(program, 'texcoord');
gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(texcoord);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// FCCを32bit符号付き整数に変換する
function FourCCToInt32(value){
    return (value.charCodeAt(0) << 0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}

// 32bit符号付き整数をFCCに変換する
function Int32ToFourCC(value){
    return String.fromCharCode(
        (value >> 0) & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}

// XMLHttpRequestの生成
var XHR = new XMLHttpRequest();

// 読み込むファイルの指定
XHR.open('GET', './sample.pvr');

// 読み込み完了時の処理
XHR.addEventListener('load', function(){
    // 圧縮テクスチャを渡す
    // gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, buffer);

    // テクスチャのパラメータを設定
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // テクスチャを設定して有効化
    gl.uniform1i(gl.getUniformLocation(program, 'texture'), texture);
    gl.activeTexture(gl.TEXTURE0);

    // 描画開始
    // draw();
});
// バイト配列として結果が帰ってくるようにする
XHR.responseType = 'arraybuffer';

// 読み込み開始
XHR.send();

// 読み込み完了後に描画を行う関数
function draw(){
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(draw);
}
