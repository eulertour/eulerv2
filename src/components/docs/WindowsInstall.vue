<template>
  <div class="documentation-text-container">
    <div class="display-1 my-4">Windows</div>
    <div class="headline">Install system libraries</div>
		<p>
      <ul>
        <li><a target="_blank" href="https://www.python.org/downloads/windows/">Python 3</a></li>
        <li><a target="_blank" href="https://ffmpeg.org/download.html#build-windows">ffmpeg</a></li>
        <li><a target="_blank" href="http://sox.sourceforge.net/Main/HomePage">sox</a></li>
        <li>A latex distribution, such as <a target="_blank" href="https://miktex.org/howto/install-miktex">MikTex</a></li>
      </ul>
		</p>

    <div class="headline">Path configuration</div>
		<p>
      To invoke commandline without supplying path to the binary the PATH
      environment needs to be configured. Below are template examples, please
      change the path according to your username and specific python version.
      Assuming all the softwares are installed with no alteration to the
      installation paths:
			<pre><code>
  C:\Users\$username\AppData\local\Programs\Python\Python$version\
  C:\Users\$username\AppData\local\Programs\Python\Python$version\Scripts\  
  C:\MikTex\miktex\bin\x64\
  C:\ffmpeg\bin\
			</code></pre>
      The path entries should be separated by semicolon.
		</p>

    <div class="headline mb-3">Installing python packages and manim</div>
		<p>
      Make sure you can start pip using <code>pip</code> in your commandline.
      Then do <code>pip install pyreadline</code> for the <code>readline</code>
      package.
    </p>
		<p>
      Grab the pycairo wheel binary <code>pycairo‑1.18.0‑cp37‑cp37m‑win32.whl</code> from
      <a target="_blank" href="https://www.lfd.uci.edu/~gohlke/pythonlibs/#pycairo">
      https://www.lfd.uci.edu/~gohlke/pythonlibs/#pycairo</a> and install it via
      <code>pip C:\absolute\path\to\the\whl\file</code>
    </p>
		<p>
      Clone the manim repository if you have git <code>git clone
      https://github.com/3b1b/manim</code> or download the zip file from the
      repository page with <code>Clone or download</code> button and unzip it.
    </p>
		<p>
      Open the commandline within the manim directory with
      <code>Shift + Right click</code> on an empty space in the folder and
      select <code>open command window here</code>
    </p>
		<p>
      Install manim python dependencies with
      <code>pip install -r requirement.txt</code>
		</p>

    <div class="headline mb-3">Test the installation</div>
		<p>
      Type in <code>python -m manim -h</code> and if nothing went wrong during
      the installtion process you should see the help text.
    </p>
		<p>
      Use <code>python -m manim example_scene.py SquareToCircle -pl</code> to
      render the example scene and the file should play after rendering. The
      movie file should be in <code>media/videos/example_scenes/480p15</code>
		</p>
  </div>
</template>

<script>export default { name: 'WindowsInstall' }</script>
