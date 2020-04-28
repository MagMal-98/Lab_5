var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
function MatrixMul(a,b) //Mnożenie macierzy
{
    c = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0
    ];
    for(let i=0;i<4;i++)
    {
        for(let j=0;j<4;j++)
        {
            c[i*4+j] = 0.0;
            for(let k=0;k<4;k++)
            {
                c[i*4+j]+= a[i*4+k] * b[k*4+j];
            }
        }
    }
    return c;
}

function startGL()
{
    let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony
    gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
    gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
    gl.viewportHeight = canvas.height;

    //Kod shaderów
    const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexColor;
    attribute vec2 aVertexCoords;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vColor;
    varying vec2 vTexUV;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vColor = aVertexColor;
      vTexUV = aVertexCoords;
    }
  `;
    const fragmentShaderSource = `
    precision highp float;
    varying vec3 vColor;
    varying vec2 vTexUV;
    uniform sampler2D uSampler;
    void main(void) {
      gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
      gl_FragColor = texture2D(uSampler,vTexUV); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
    }
  `;
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera
    let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
    gl.shaderSource(vertexShader, vertextShaderSource);
    gl.compileShader(fragmentShader); //Kompilacja kodu shader
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    shaderProgram = gl.createProgram(); //Stworzenie obiektu programu
    gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów

    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z
    let vertexPosition = [
        // Słońce
        //przód
        -60.0,  30.0,  30.0,   -60.0, -30.0,  30.0,    0.0,  30.0,  30.0,
        -60.0, -30.0,  30.0,     0.0,  30.0,  30.0,    0.0, -30.0,  30.0,
        //tył
        -60.0,  30.0, -30.0,   -60.0, -30.0, -30.0,    0.0,  30.0, -30.0,
        -60.0, -30.0, -30.0,     0.0,  30.0, -30.0,    0.0, -30.0, -30.0,
        //lewy bok
        -60.0,  30.0,  30.0,   -60.0,  30.0, -30.0,   -60.0, -30.0, -30.0,
        -60.0,  30.0,  30.0,   -60.0, -30.0, -30.0,   -60.0, -30.0,  30.0,
        //prawy bok
        0.0,  30.0,  30.0,     0.0,  30.0, -30.0,    0.0, -30.0, -30.0,
        0.0,  30.0,  30.0,     0.0, -30.0, -30.0,    0.0, -30.0,  30.0,
        //dół
        -60.0, -30.0,  30.0,   -60.0, -30.0, -30.0,    0.0, -30.0,  30.0,
        -60.0, -30.0, -30.0,     0.0, -30.0,  30.0,    0.0, -30.0, -30.0,
        //góra
        -60.0,  30.0,  30.0,   -60.0,  30.0, -30.0,    0.0,  30.0,  30.0,
        -60.0,  30.0, -30.0,     0.0,  30.0,  30.0,    0.0,  30.0, -30.0,

        // Merkury
        //przód
        11.4,  0.3,  0.3,    11.4, -0.3,  0.3,    11.9,  0.3,  0.3,
        11.4, -0.3,  0.3,    11.9,  0.3,  0.3,    11.9, -0.3,  0.3,
        //tył
        11.4,  0.3, -0.3,    11.4, -0.3, -0.3,    11.9,  0.3, -0.3,
        11.4, -0.3, -0.3,    11.9,  0.3, -0.3,    11.9, -0.3, -0.3,
        //lewy bok
        11.4,  0.3, -0.3,    11.4, -0.3, -0.3,    11.4, -0.3,  0.3,
        11.4,  0.3, -0.3,    11.4, -0.3,  0.3,    11.4,  0.3,  0.3,
        //prawy bok
        11.9,  0.3, -0.3,    11.9, -0.3, -0.3,    11.9, -0.3,  0.3,
        11.9,  0.3, -0.3,    11.9, -0.3,  0.3,    11.9,  0.3,  0.3,
        //dół
        11.4, -0.3,  0.3,    11.4, -0.3, -0.3,    11.9, -0.3,  0.3,
        11.4, -0.3, -0.3,    11.9, -0.3,  0.3,    11.9, -0.3, -0.3,
        //góra
        11.4,  0.3,  0.3,    11.4,  0.3, -0.3,    11.9,  0.3,  0.3,
        11.4,  0.3, -0.3,    11.9,  0.3,  0.3,    11.9,  0.3, -0.3,

        // Wenus
        //przód
        21.6,  0.6,  0.6,    21.6, -0.6,  0.6,    22.8,  0.6,  0.6,
        21.6, -0.6,  0.6,    22.8,  0.6,  0.6,    22.8, -0.6,  0.6,
        //tył
        21.6,  0.6, -0.6,    21.6, -0.6, -0.6,    22.8,  0.6, -0.6,
        21.6, -0.6, -0.6,    22.8,  0.6, -0.6,    22.8, -0.6, -0.6,
        //lewy bok
        21.6,  0.6, -0.6,    21.6, -0.6, -0.6,    21.6, -0.6,  0.6,
        21.6,  0.6,  0.6,    21.6, -0.6,  0.6,    21.6,  0.6, -0.6,
        //prawy bok
        22.8,  0.6, -0.6,    22.8, -0.6, -0.6,    22.8, -0.6,  0.6,
        22.8,  0.6,  0.6,    22.8, -0.6,  0.6,    22.8,  0.6, -0.6,
        //dół
        21.6, -0.6,  0.6,    21.6, -0.6, -0.6,    22.8, -0.6, -0.6,
        21.6, -0.6,  0.6,    22.8, -0.6,  0.6,    22.8, -0.6, -0.6,
        //góra
        21.6,  0.6,  0.6,    21.6,  0.6, -0.6,    22.8,  0.6, -0.6,
        21.6,  0.6,  0.6,    22.8,  0.6,  0.6,    22.8,  0.6, -0.6,

        // Ziemia
        //przód
        29.8,  0.65,  0.65,    29.8, -0.65,  0.65,    31.1,  0.65,  0.65,
        29.8, -0.65,  0.65,    31.1,  0.65,  0.65,    31.1, -0.65,  0.65,
        //tył
        29.8,  0.65, -0.65,    29.8, -0.65, -0.65,    31.1,  0.65, -0.65,
        29.8, -0.65, -0.65,    31.1,  0.65, -0.65,    31.1, -0.65, -0.65,
        //lewy bok
        29.8,  0.65, -0.65,    29.8, -0.65, -0.65,    29.8, -0.65,  0.65,
        29.8,  0.65,  0.65,    29.8, -0.65,  0.65,    29.8,  0.65, -0.65,
        //prawy bok
        31.1,  0.65, -0.65,    31.1, -0.65, -0.65,    31.1, -0.65,  0.65,
        31.1,  0.65,  0.65,    31.1, -0.65,  0.65,    31.1,  0.65, -0.65,
        //dół
        29.8, -0.65,  0.65,    29.8, -0.65, -0.65,    31.1, -0.65, -0.65,
        29.8, -0.65,  0.65,    31.1, -0.65,  0.65,    31.1, -0.65, -0.65,
        //góra
        29.8,  0.65,  0.65,    29.8,  0.65, -0.65,    31.1,  0.65, -0.65,
        29.8,  0.65,  0.65,    31.1,  0.65,  0.65,    31.1,  0.65, -0.65,

        // Księżyc
        //przód
        28.2,  0.15,  0.15,    28.2, -0.15,  0.15,    28.5,  0.15,  0.15,
        28.2, -0.15,  0.15,    28.5,  0.15,  0.15,    28.5, -0.15,  0.15,
        //tył
        28.2,  0.15, -0.15,    28.2, -0.15, -0.15,    28.5,  0.15, -0.15,
        28.2, -0.15, -0.15,    28.5,  0.15, -0.15,    28.5, -0.15, -0.15,
        //lewy bok
        28.2,  0.15, -0.15,    28.2, -0.15, -0.15,    28.2, -0.15,  0.15,
        28.2,  0.15,  0.15,    28.2, -0.15,  0.15,    28.2,  0.15, -0.15,
        //prawy bok
        28.5,  0.15, -0.15,    28.5, -0.15, -0.15,    28.5, -0.15,  0.15,
        28.5,  0.15,  0.15,    28.5, -0.15,  0.15,    28.5,  0.15, -0.15,
        //dół
        28.2, -0.15,  0.15,    28.2, -0.15, -0.15,    28.5, -0.15, -0.15,
        28.2, -0.15,  0.15,    28.5, -0.15,  0.15,    28.5, -0.15, -0.15,
        //góra
        28.2,  0.15,  0.15,    28.2,  0.15, -0.15,    28.5,  0.15, -0.15,
        28.2,  0.15,  0.15,    28.5,  0.15,  0.15,    28.5,  0.15, -0.15,

        // Mars
        //przód
        45.4,  0.35,  0.35,    45.4, -0.35,  0.35,    46.1,  0.35,  0.35,
        45.4, -0.35,  0.35,    46.1,  0.35,  0.35,    46.1, -0.35,  0.35,
        //tył
        45.4,  0.35, -0.35,    45.4, -0.35, -0.35,    46.1,  0.35, -0.35,
        45.4, -0.35, -0.35,    46.1,  0.35, -0.35,    46.1, -0.35, -0.35,
        //lewy bok
        45.4,  0.35, -0.35,    45.4, -0.35, -0.35,    45.4, -0.35,  0.35,
        45.4,  0.35,  0.35,    45.4, -0.35,  0.35,    45.4,  0.35, -0.35,
        //prawy bok
        46.1,  0.35, -0.35,    46.1, -0.35, -0.35,    46.1, -0.35,  0.35,
        46.1,  0.35,  0.35,    46.1, -0.35,  0.35,    46.1,  0.35, -0.35,
        //dół
        45.4, -0.35,  0.35,    45.4, -0.35, -0.35,    46.1, -0.35, -0.35,
        45.4, -0.35,  0.35,    46.1, -0.35,  0.35,    46.1, -0.35, -0.35,
        //góra
        45.4,  0.35,  0.35,    45.4,  0.35, -0.35,    46.1,  0.35, -0.35,
        45.4,  0.35,  0.35,    46.1,  0.35,  0.35,    46.1,  0.35, -0.35,

        // Jowisz
        //przód
        155.6,  7.15,  7.15,    155.6, -7.15,  7.15,    169.9,  7.15,  7.15,
        155.6, -7.15,  7.15,    169.9,  7.15,  7.15,    169.9, -7.15,  7.15,
        //tył
        155.6,  7.15, -7.15,    155.6, -7.15, -7.15,    169.9,  7.15, -7.15,
        155.6, -7.15, -7.15,    169.9,  7.15, -7.15,    169.9, -7.15, -7.15,
        //lewy bok
        155.6,  7.15, -7.15,    155.6, -7.15, -7.15,    155.6, -7.15,  7.15,
        155.6,  7.15,  7.15,    155.6, -7.15,  7.15,    155.6,  7.15, -7.15,
        //prawy bok
        169.9,  7.15, -7.15,    169.9, -7.15, -7.15,    169.9, -7.15,  7.15,
        169.9,  7.15,  7.15,    169.9, -7.15,  7.15,    169.9,  7.15, -7.15,
        //dół
        155.6, -7.15,  7.15,    155.6, -7.15, -7.15,    169.9, -7.15, -7.15,
        155.6, -7.15,  7.15,    169.9, -7.15,  7.15,    169.9, -7.15, -7.15,
        //góra
        155.6,  7.15,  7.15,    155.6,  7.15, -7.15,    169.9,  7.15, -7.15,
        155.6,  7.15,  7.15,    169.9,  7.15,  7.15,    169.9,  7.15, -7.15,


        // Saturn
        //przód
        285.2,  6.0,  6.0,    285.2, -6.0,  6.0,    297.2,  6.0,  6.0,
        285.2, -6.0,  6.0,    297.2,  6.0,  6.0,    297.2, -6.0,  6.0,
        //tył
        285.2,  6.0, -6.0,    285.2, -6.0, -6.0,    297.2,  6.0, -6.0,
        285.2, -6.0, -6.0,    297.2,  6.0, -6.0,    297.2, -6.0, -6.0,
        //lewy bok
        285.2,  6.0, -6.0,    285.2, -6.0, -6.0,    285.2, -6.0,  6.0,
        285.2,  6.0,  6.0,    285.2, -6.0,  6.0,    285.2,  6.0, -6.0,
        //prawy bok
        297.2,  6.0, -6.0,    297.2, -6.0, -6.0,    297.2, -6.0,  6.0,
        297.2,  6.0,  6.0,    297.2, -6.0,  6.0,    297.2,  6.0, -6.0,
        //dół
        285.2, -6.0,  6.0,    285.2, -6.0, -6.0,    297.2, -6.0, -6.0,
        285.2, -6.0,  6.0,    297.2, -6.0,  6.0,    297.2, -6.0, -6.0,
        //góra
        285.2,  6.0,  6.0,    285.2,  6.0, -6.0,    297.2,  6.0, -6.0,
        285.2,  6.0,  6.0,    297.2,  6.0,  6.0,    297.2,  6.0, -6.0,


        // Uran
        //przód
        574,  2.55,  2.55,    574,   -2.55,  2.55,    579.1,  2.55,  2.55,
        574, -2.55,  2.55,    579.1,  2.55,  2.55,    579.1, -2.55,  2.55,
        //tył
        574,  2.55, -2.55,    574,   -2.55, -2.55,    579.1,  2.55, -2.55,
        574, -2.55, -2.55,    579.1,  2.55, -2.55,    579.1, -2.55, -2.55,
        //lewy bok
        574,  2.55, -2.55,    574,   -2.55, -2.55,    574,   -2.55,  2.55,
        574,  2.55,  2.55,    574,   -2.55,  2.55,    574,    2.55, -2.55,
        //prawy bok
        579.1, 2.55, -2.55,    579.1, -2.55, -2.55,    579.1, -2.55,  2.55,
        579.1, 2.55,  2.55,    579.1, -2.55,  2.55,    579.1,  2.55, -2.55,
        //dół
        574, -2.55,  2.55,    574,   -2.55, -2.55,    579.1, -2.55, -2.55,
        574, -2.55,  2.55,    579.1, -2.55,  2.55,    579.1, -2.55, -2.55,
        //góra
        574,  2.55,  2.55,    574,    2.55, -2.55,    579.1,  2.55, -2.55,
        574,  2.55,  2.55,    579.1,  2.55,  2.55,    579.1,  2.55, -2.55,


        // Neptun
        //przód
        898.00,  2.45,  2.45,    898.00, -2.45,  2.45,    902.90,  2.45,  2.45,
        898.00, -2.45,  2.45,    902.90,  2.45,  2.45,    902.90, -2.45,  2.45,
        //tył
        898.00,  2.45, -2.45,    898.00, -2.45, -2.45,    902.90,  2.45, -2.45,
        898.00, -2.45, -2.45,    902.90,  2.45, -2.45,    902.90, -2.45, -2.45,
        //lewy bok
        898.00,  2.45, -2.45,    898.00, -2.45, -2.45,    898.00, -2.45,  2.45,
        898.00,  2.45,  2.45,    898.00, -2.45,  2.45,    898.00,  2.45, -2.45,
        //prawy bok
        902.90,  2.45, -2.45,    902.90, -2.45, -2.45,    902.90, -2.45,  2.45,
        902.90,  2.45,  2.45,    902.90, -2.45,  2.45,    902.90,  2.45, -2.45,
        //dół
        898.00, -2.45,  2.45,    898.00, -2.45, -2.45,    902.90, -2.45, -2.45,
        898.00, -2.45,  2.45,    902.90, -2.45,  2.45,    902.90, -2.45, -2.45,
        //góra
        898.00,  2.45,  2.45,    898.00,  2.45, -2.45,    902.90,  2.45, -2.45,
        898.00,  2.45,  2.45,    902.90,  2.45,  2.45,    902.90,  2.45, -2.45,


    ];

    vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
    vertexPositionBuffer.numItems = 120; //Zdefinoiowanie liczby punktów w naszym buforze

    //Opis sceny 3D, kolor każdego z wierzchołków
    let vertexColor = [

        // Słońce

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //Merkury

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //Wenus

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //Ziemia

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //księżyc

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //Mars

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,

        //Jowisz

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,


        //Saturn

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,


        //Uran

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,


        //Neptun

        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,

        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,

        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,

        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 0.0, 1.0,

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,


    ];
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 3;
    vertexColorBuffer.numItems = 120;

    let vertexCoords = [
        //Słońce

        0.6, 0.0,   0.6, 1.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        0.6, 0.0,   0.6, 1.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        0.6, 1.0,   0.6, 0.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        0.6, 1.0,   0.6, 0.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        0.6, 0.0,   0.6, 1.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        0.6, 0.0,   0.6, 1.0,   0.7, 0.0,
        0.6, 1.0,   0.7, 0.0,   0.7, 1.0,

        //Merkury

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.3, 0.0,    0.3, 1.0,  0.4, 0.0,
        0.3, 1.0,    0.4, 0.0,  0.4, 1.0,

        //Wenus

        0.8, 0.0,    0.8, 1.0,  0.9, 0.0,
        0.8, 1.0,    0.9, 0.0,  0.9, 1.0,

        0.8, 0.0,    0.8, 1.0,  0.9, 0.0,
        0.8, 1.0,    0.9, 0.0,  0.9, 1.0,

        0.9, 0.0,    0.8, 0.0,  0.8, 1.0,
        0.9, 1.0,    0.8, 1.0,  0.9, 0.0,

        0.9, 0.0,    0.8, 0.0,  0.8, 1.0,
        0.9, 1.0,    0.8, 1.0,  0.9, 0.0,

        0.9, 0.0,    0.8, 0.0,   0.8, 1.0,
        0.9, 1.0,    0.8, 1.0,   0.9, 0.0,

        0.9, 0.0,    0.8, 0.0,   0.8, 1.0,
        0.9, 1.0,    0.8, 1.0,   0.9, 0.0,

        //Ziemia

        0.9, 0.0,    0.9, 1.0,  1.0, 0.0,
        0.9, 1.0,    1.0, 0.0,  1.0, 1.0,

        0.9, 0.0,    0.9, 1.0,  1.0, 0.0,
        0.9, 1.0,    1.0, 0.0,  1.0, 1.0,

        1.0, 0.0,    0.9, 0.0,  0.9, 1.0,
        1.0, 1.0,    0.9, 1.0,  1.0, 0.0,

        1.0, 0.0,    0.9, 0.0,  0.9, 1.0,
        1.0, 1.0,    0.9, 1.0,  1.0, 0.0,

        0.9, 1.0,    0.9, 0.0,  1.0, 0.0,
        0.9, 1.0,    1.0, 1.0,  1.0, 0.0,

        0.9, 1.0,    0.9, 0.0,  1.0, 0.0,
        0.9, 1.0,    1.0, 1.0,  1.0, 0.0,

        //Księżyc

        0.1, 0.0,    0.1, 1.0,  0.2, 0.0,
        0.1, 1.0,    0.2, 0.0,  0.2, 1.0,

        0.1, 0.0,    0.1, 1.0,  0.2, 0.0,
        0.1, 1.0,    0.2, 0.0,  0.2, 1.0,

        0.2, 0.0,    0.1, 0.0,  0.1, 1.0,
        0.2, 1.0,    0.1, 1.0,  0.2, 0.0,

        0.2, 0.0,    0.1, 0.0,  0.1, 1.0,
        0.2, 1.0,    0.1, 1.0,  0.1, 0.0,

        0.1, 1.0,    0.1, 0.0,  0.2, 0.0,
        0.1, 1.0,    0.2, 1.0,  0.2, 0.0,

        0.1, 1.0,    0.1, 0.0,  0.2, 0.0,
        0.1, 1.0,    0.2, 1.0,  0.2, 0.0,

        //Mars

        0.2, 0.0,    0.2, 1.0,  0.3, 0.0,
        0.2, 1.0,    0.3, 0.0,  0.3, 1.0,

        0.2, 0.0,    0.2, 1.0,  0.3, 0.0,
        0.2, 1.0,    0.3, 0.0,  0.3, 1.0,

        0.3, 0.0,    0.2, 0.0,  0.2, 1.0,
        0.3, 1.0,    0.2, 1.0,  0.3, 0.0,

        0.3, 0.0,    0.2, 0.0,  0.2, 1.0,
        0.3, 1.0,    0.2, 1.0,  0.3, 0.0,

        0.2, 1.0,    0.2, 0.0,  0.3, 0.0,
        0.2, 1.0,    0.3, 1.0,  0.3, 0.0,

        0.2, 1.0,    0.2, 0.0,  0.3, 0.0,
        0.2, 1.0,    0.3, 1.0,  0.3, 0.0,


        //Jowisz

        0.0, 0.0,    0.0, 1.0,  0.1, 0.0,
        0.0, 1.0,    0.1, 0.0,  0.1, 1.0,

        0.0, 0.0,    0.0, 1.0,  0.1, 0.0,
        0.0, 1.0,    0.1, 0.0,  0.1, 1.0,

        0.1, 0.0,    0.0, 0.0,  0.0, 1.0,
        0.1, 1.0,    0.0, 1.0,  0.1, 0.0,

        0.1, 0.0,    0.0, 0.0,  0.0, 1.0,
        0.1, 1.0,    0.0, 1.0,  0.1, 0.0,

        0.0, 1.0,    0.0, 0.0,  0.1, 0.0,
        0.0, 1.0,    0.1, 1.0,  0.1, 0.0,

        0.0, 1.0,    0.0, 0.0,  0.1, 0.0,
        0.0, 1.0,    0.1, 1.0,  0.1, 0.0,


        //Saturn

        0.6, 0.0,    0.6, 1.0,  0.5, 0.0,
        0.6, 1.0,    0.5, 0.0,  0.5, 1.0,

        0.6, 0.0,    0.6, 1.0,  0.5, 0.0,
        0.6, 1.0,    0.5, 0.0,  0.5, 1.0,

        0.6, 0.0,    0.5, 0.0,  0.5, 1.0,
        0.6, 1.0,    0.5, 1.0,  0.6, 0.0,

        0.6, 0.0,    0.5, 0.0,  0.5, 1.0,
        0.6, 1.0,    0.5, 1.0,  0.6, 0.0,

        0.6, 1.0,    0.6, 0.0,  0.5, 0.0,
        0.6, 1.0,    0.5, 1.0,  0.5, 0.0,

        0.6, 1.0,    0.6, 0.0,  0.5, 0.0,
        0.6, 1.0,    0.5, 1.0,  0.5, 0.0,


        //Uran

        0.8, 0.0,    0.8, 1.0,  0.7, 0.0,
        0.8, 1.0,    0.7, 0.0,  0.7, 1.0,

        0.8, 0.0,    0.8, 1.0,  0.7, 0.0,
        0.8, 1.0,    0.7, 0.0,  0.7, 1.0,

        0.8, 0.0,    0.7, 0.0,  0.7, 1.0,
        0.8, 1.0,    0.7, 1.0,  0.8, 0.0,

        0.8, 0.0,    0.7, 0.0,  0.7, 1.0,
        0.8, 1.0,    0.7, 1.0,  0.8, 0.0,

        0.8, 1.0,    0.8, 0.0,  0.7, 0.0,
        0.8, 1.0,    0.7, 1.0,  0.7, 0.0,

        0.8, 1.0,    0.8, 0.0,  0.7, 0.0,
        0.8, 1.0,    0.7, 1.0,  0.7, 0.0,


        //Neptun

        0.5, 0.0,    0.5, 1.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.5, 0.0,    0.5, 1.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.5, 0.0,    0.5, 1.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.5, 0.0,    0.5, 1.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 0.0,  0.4, 1.0,

        0.5, 1.0,    0.5, 0.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 1.0,  0.4, 0.0,

        0.5, 1.0,    0.5, 0.0,  0.4, 0.0,
        0.5, 1.0,    0.4, 1.0,  0.4, 0.0,

    ];

    vertexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
    vertexCoordsBuffer.itemSize = 2;
    vertexCoordsBuffer.numItems = 120;

    textureBuffer = gl.createTexture();
    var textureImg = new Image();
    textureImg.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    textureImg.src="planets.png";



    //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
    let aspect = gl.viewportWidth/gl.viewportHeight;
    let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
    let zFar = 1000.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
    let zNear = 0.1;
    uPMatrix = [
        1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
        0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
        0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
        0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
    ];
    Tick();
}
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery
var angleZ = 0.0;
var angleY = 0.0;
var angleX = 0.0;
var tz = -100.0;
var tx = 0.0;
var ty = -0.5;

function Tick()
{
    let uMVMatrix = [
        1,0,0,0, //Macierz jednostkowa
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let uMVRotZ = [
        +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
        -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let uMVRotY = [
        +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
        0,1,0,0,
        +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
        0,0,0,1
    ];

    let uMVRotX = [
        1,0,0,0,
        0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
        0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
        0,0,0,1
    ];

    let uMVTranslateZ = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,tz,1
    ];

    let uMVTranslateX = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        tx,0,0,1
    ];

    let uMVTranslateY = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,ty,0,1
    ];

    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateZ);
    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateX);
    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateY);

    uMVMatrix = MatrixMul(uMVMatrix,uMVRotX);
    uMVMatrix = MatrixMul(uMVMatrix,uMVRotY);
    uMVMatrix = MatrixMul(uMVMatrix,uMVRotZ);


    //alert(uPMatrix);

    //Render Scene
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0,0.0,0.0,1.0); //Wyczyszczenie obrazu kolorem czerwonym
    gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram);   //Użycie przygotowanego programu shaderowego

    gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
    gl.depthFunc(gl.LEQUAL);            //

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix));

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazanie kolorów
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexCoords"));  //Pass the geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexCoords"), vertexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

    setTimeout(Tick,100);
}
function handlekeydown(e)
{
    if(e.keyCode==87) angleX=angleX+1.0; //W
    if(e.keyCode==83) angleX=angleX-1.0; //S
    if(e.keyCode==68) angleY=angleY+1.0;
    if(e.keyCode==65) angleY=angleY-1.0;
    if(e.keyCode==81) angleZ=angleZ+1.0;
    if(e.keyCode==69) angleZ=angleZ-1.0;
    if(e.keyCode==73) tz = tz+2.0; //i forward
    if(e.keyCode==75) tz = tz-2.0;
    if(e.keyCode==74) tx = tx+2.0;
    if(e.keyCode==76) tx = tx-2.0;
    if(e.keyCode==85) ty = ty-2.0;
    if(e.keyCode==79) ty = ty+2.0;

}
