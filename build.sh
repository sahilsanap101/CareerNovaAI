#!/bin/bash
cd research/paper
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
