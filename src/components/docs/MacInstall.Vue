<template>
  <div class="documentation-text-container">
    <div class="display-1 my-4">Mac</div>
    <div class="headline">Install system libraries</div>
		<p>
      To install most system libraries the easiest method is to use the <a target="_blank" href="https://https://brew.sh/">homebrew package manager</a>.  For install instructsio
      <ul>
        <li>
          <a target="_blank" href="https://www.python.org/downloads/windows/">Python 3</a> (note starting in 10.15 Catalina, Python3 is installed by default, the below code will allow installation on earlier operating system versions
          <pre><code>
            $ brew install python
			    </code></pre>
        </li>
        <li><a target="_blank" href="https://ffmpeg.org/download.html#build-windows">ffmpeg</a>
          <pre><code>
            $ brew install ffmpeg
			    </code></pre>
        </li>
        <li><a target="_blank" href="http://sox.sourceforge.net/Main/HomePage">sox</a>
          <pre><code>
            $ brew install sox
			    </code></pre>
        </li>
        <li><a target="_blank" href="https://cairographics.org/">Cairo</a>
          <pre><code>
            $ brew install cairo
          </code></pre>
        </li>
        <li>A latex distribution, such as <a target="_blank" href="https://tug.org/mactex/">MacTeX</a>
          <pre><code>
            $ brew cask install mactex
          </code></pre>
        </li>
      </ul>
		</p>
    
    <div class="headline mb-3">Installing python packages and manim</div>
		<p>
      Make sure you can start pip using <code>pip3</code> in your commandline.
      Then do <code>pip install pyreadline</code> for the <code>readline</code>
      package.
    </p>
		<p>
      Install the the pycairo library via 
      <code>$ pip install pycairo</code>
    </p>
		<p>
      Clone the manim repository if you have git <code>git clone
      https://github.com/3b1b/manim</code> or download the zip file from the
      repository page with <code>Clone or download</code> button and unzip it.
    </p>
		<p>
      To open a terminal within the manim directory,
      <code>Right click</code> on the manim folder and
      select <code>Services -> Open New Terminal Window</code>
    </p>
		<p>
      Install manim python dependencies with
      <code>pip install -r requirement.txt</code>
		</p>

    <div class="headline mb-3">Test the installation</div>
		<p>
      Type in <code>python -m manim -h</code> and if nothing went wrong during
      the installation process you should see the help text.
    </p>
		<p>
      Use <code>python -m manim example_scene.py SquareToCircle -pl</code> to
      render the example scene and the file should play after rendering. The
      movie file should be in <code>media/videos/example_scenes/480p15</code>
		</p>
  </div>
</template>

<script>export default { name: 'MacInstall' }</script>
