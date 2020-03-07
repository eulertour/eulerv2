<template>
  <div class="documentation-text-container">
    <div class="display-1 my-4">Linux</div>
		<div class="headline my-4">Ubuntu</div>
		<p>
			Install system libraries:
			<Prism language="bash" code=
"apt install sox ffmpeg libcairo2 libcairo2-dev"
			/>
		</p>

		<p>
			Install Latex distribution:
			<Prism language="bash" code=
"apt install texlive-full"
			/>
		</p>

		<p>
			Install manim via pypi:
			<Prism language="bash" code=
"pip3 install manimlib"
			/>
		</p>

		<p>
			OR install manim via the git repository with venv:
			<Prism language="bash" code=
"git clone https://github.com/3b1b/manim
 cd manim
 python3 -m venv ./
 source bin/activate
 pip3 install -r requirements.txt"
			/>
		</p>

		<p>
			To use manim in virtual environment you need to activate the environment
			with the <code>activate</code> binary by doing
			<code>source bin/activate</code>, to exit use the <code>deactivate</code>
			command.
		</p>

		<div class="note">
			<div class="title font-weight-bold">Note</div>
			The git repository is updated before the one on pypi. The git repository
			also includes project files used to produce 3b1b videos. However, some of
			the old projects might not work due to api changes.
		</div>

		<div class="note">
			<div class="title font-weight-bold">Note</div>
			The required latex packages are dictated by
			<code>manimlib/tex_template.tex</code> which <code>texlive-full</code>
			will satisfy. The download size can be quite large. If
			you wish to install only the packages required to use manim, substitute
			<code>texlive-full</code> with:
			<Prism language="bash" code=
"texlive texlive-latex-extra texlive-fonts-extra
 texlive-latex-recommended texlive-science texlive-fonts-extra tipa"
			/>
		</div>
  </div>
</template>

<script>
import Prism from 'vue-prism-component'
export default {
	name: 'LinuxInstall',
	components: { Prism },
}
</script>
