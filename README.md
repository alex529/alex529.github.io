# 02806
## Assignment 1.
Formalia:

Please read the [assignment overview page](https://github.com/suneman/socialdataanalysis2018/wiki/Assignments) carefully before proceeding. This page contains information about formatting (including formats etc), group sizes, and many other aspects of handing in the assignment.

*If you fail to follow these simple instructions, it will negatively impact your grade!*

**Due date and time**: The assignment is due on Monday Februrary 26th, 2018 at 23:55. Hand in your files via http://peergrade.io.

**Peergrading date and time**: *Remember that after handing in you have 24 hours to evaluate a few assignments written by other members of the class.* Thus, the peer evaluations are due on Monday March th, 2018 at 23:55.

## Part 1: DAOST Chapter 2 Questions
* Explain in your own words the point of the jitter plot.
* Explain in your own words the point of figure 2-3. (I'm going to skip saying "in your own words" going forward, but I hope you get the point; I expect all answers to be in your own words).
* The author of DAOST (Philipp Janert) likes KDEs (and think they're better than histograms). And I don't. I didn't give a detailed explanation in the video, but now that works to my advantage. I'll ask you guys to think about this and thereby create an excellent exercise: When can KDEs be misleading?
* I've discussed some strengths of the CDF - there are also weaknesses. Janert writes "[CDFs] have less intuitive appeal than histograms of KDEs". What does he mean by that?
* What is a Quantile plot? What is it good for.
* How is a Probablity plot defined? What is it useful for? Have you ever seen one before?
* One of the reasons I like DAOST is that Janert is so suspicious of mean, median, and related summary statistics. Explain why one has to be careful when using those - and why visualization of the full data is always better.
* I love box plots. When are box plots most useful?
* The book doesn't mention violin plots. Are those better or worse than box plots? Why?

## Part 2: DAOST Chapter 3 Questions
* Looking at Fig 3-1, Janert writes "the data itself shows clearly that the amount of random noise in the data is small". What do you think his argument is?
* Can you think of a real-world example of a multivariate relationship like the one in Fig 3-3 (lower right panel)?
* What are the two methods Janert metions for smoothing noisy data? Can you think of other ones?
* What are residuals? Why is it a good idea to plot the residuals of your fit?
* Explain in your own words the point of the smooth tube in figure 3-7.
* What kind of relationships will a semi-log plot help you discover?
* What kind of functions will loglog plots help you see?
* What the h#ll is banking and what element from our visual system does it use to help us see patterns? What are potential problems with banking?
* I think figure 3-14 makes an important point about linear fits that is rarely made. What is it?
* Summarize the discussion of Graphical Analysis and Presentation Graphics on pp. 68-69 in your own words.

## Part 3: Viz 1
Re-creating an "I quant NY" page.

* Read the page http://iquantny.tumblr.com/post/129373499164/this-is-quantifiably-the-best-month-to-go-to-the
* On your `html` page, write "This is a reproduction of http://iquantny.tumblr.com/post/129373499164/this-is-quantifiably-the-best-month-to-go-to-the as the first line" (we don't want you guys to get in trouble with plagiarims).
* Then format the page nicely with `CSS` styles that you like and put in the text from the original page.
* Now, let's look at the first plot.

![plot](https://raw.githubusercontent.com/suneman/socialdataanalysis2018/master/files/iquantny.png)
* I want you to create a beautiful version of this barchart and place it in the right position on the page you've just created. It should be a little bit different than it is on the page:
	* I want the user to be able to choose which data to display, by (for example) clicking the type of produce (Fresh Fruit, Fresh Veggie, etc). You only need to dislplay one category at the time.
	* The yy-scale should change dynamically to fit the data
	* Make sure you have the right axes, axes labels, title.
	* You choose the remaining style.
* **Optional** (for advanced users) create a stacked barchar.
* **Optional** (for advanced users) put all four categories side-by-side in little groups of four (still enabling the user to turn categories on/off). Once you have finished your visualization, update the text to describe it.

## Part 4: Viz 2
The idea is to recreate DAOST figure 3-5, but with data from the Boston Marathon winning times [get them here](https://en.wikipedia.org/wiki/List_of_winners_of_the_Boston_Marathon). You don't have to plot the smooth-curve approximations, it's enough to do the straight line fits.

* First get the data from wikipedia onto your computer (there are may ways to do this, from pasting the table into Excel, or your favorite WYSIWIG editor to downloading the wikipage's markdown source ... it's your choice). Or try out OpenRefine as [mentioned in the book](https://www.propublica.org/nerds/using-google-refine-for-data-cleaning). New: I hear this one is pretty great for extracting tables from wikipedia: http://wikitable2csv.ggor.de/.
* You probably also want to convert the time in hours into minutes - once again there are many ways to do that. It's your choice.
* Start by plotting the raw data. Use different symbols for men/women. Do you see the same trends as in the data used in the book?
* Use `path` from Chapter 11 to connect the dots.
* Add your straight-line fit. You can do this in D3, but if you'd like it's OK to calculate the fit elsewhere (Python, Matlab, R, etc) and then simply add the straight line to the plot.
	* If you want to try your luck with pure D3, you might find inspiration [in this](http://bl.ocks.org/benvandyke/8459843) `bl.ock`.
* Make sure you have a plot description, axes labels, and legend somewhere.
* Set up the plot so you can toggle between *only women, only men, all data,* using our skills from last time.
* Add tooltips that show the time & year, when you hover over a point, using our skills from chapter 10. Feel free to implement the tooltips any way you like.
* Bonus (**optional**), also show the name of the winner corresponding to a datapoint in the tooltip.