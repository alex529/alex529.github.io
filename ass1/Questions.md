# Part 1: DAOST Chapter 2 Questions

#### Explain in your own words the point of the jitter plot.
A jitter point is used to make graphs of data-points that are clustered together in specific points, therefore getting a good idea of how many data points are identical.

#### Explain in your own words the point of figure 2-3. (I'm going to skip saying "in your own words" going forward, but I hope you get the point; I expect all answers to be in your own words).
Figure 2-3 show the how big difference can make the alignment of the bins, and how easily a dataset can be misunderstood. By having the bin that large we lose information in the visualization.

#### The author of DAOST (Philipp Janert) likes KDEs (and think they're better than histograms). And I don't. I didn't give a detailed explanation in the video, but now that works to my advantage. I'll ask you
 guys to think about this and thereby create an excellent exercise: When can KDEs be misleading?
KDE can be misleading because it makes the visualization smooth, thus it looks that the graph has many data-points, when it can have just a couple.

#### I've discussed some strengths of the CDF - there are also weaknesses. Janert writes "[CDFs] have less intuitive appeal than histograms of KDEs". What does he mean by that?
CDF may be less intuitive because it visualizes a different kind of data instead of showing the amplitude it shows the frequency of the data-points.

#### What is a Quantile plot? What is it good for.
Its a CDF plot with the axis switched, visualizing how often the data-points occur.

#### How is a Probability plot defined? What is it useful for? Have you ever seen one before?
Probability plot is formed by plotting ????? 
It can easily show if the data-points fallow a distribution.
No

#### One of the reasons I like DAOST is that Janert is so suspicious of mean, median, and related summary statistics. Explain why one has to be careful when using those - and why visualization of the full data is always better.
This is the problem that is described in Simpson's paradox. If the data is grouped the trends are different compared with the trends that are generated from the aggregated data. By visualizing the data this error can be spotted very easily.

#### I love box plots. When are box plots most useful?
Box plots are used a lot in visualizing stocks, a lot of information can be shown using this plot, each box containing the median, min&max observations and lower&upper quartile.

#### The book doesn't mention violin plots. Are those better or worse than box plots? Why?
The violin plots show more data than the box-plots, the violin plot shows the full distribution if the data.

# Part 2: DAOST Chapter 3 Questions

#### Looking at Fig 3-1, Janert writes "the data itself shows clearly that the amount of random noise in the data is small". What do you think his argument is?
Fig 3-1 shows a graph that fallows a specific pattern which could fallow a specific equation.

#### Can you think of a real-world example of a multivariate relationship like the one in Fig 3-3 (lower right panel)?
?????

#### What are the two methods Janert mentions for smoothing noisy data? Can you think of other ones?
Applying a filter to the data. ex: Low-Pass Filter

#### What are residuals? Why is it a good idea to plot the residuals of your fit?
Residuals are the reminder of the smoothening process, by looking at the residuals one can verify if the smoothening is accurate, the residuals shouldn't have a trend it should be balanced, having both positive and negative values. 

#### Explain in your own words the point of the smooth tube in figure 3-7.
It is just a double-check, or how the book says, gives confidence, of how accurate the smooth representation is.

#### What kind of relationships will a semi-log plot help you discover?
Semi-log plots are very good at discovering relative changes.

#### What kind of functions will loglog plots help you see?
LogLog plots help in visualizing data that spans many orders of magnitude

#### What the h#ll is banking and what element from our visual system does it use to help us see patterns? What are potential problems with banking?
Banking is the process where the scale of the graph is changed so the slopes are ~ 45 degrees, this change makes it much easier for the human bran to perceive change. In some cases to achieve 45 degrees the graph needs to be skewed to much the graph becomes unreadable, or it has to be stacked. 

#### I think figure 3-14 makes an important point about linear fits that is rarely made. What is it?
?????

#### Summarize the discussion of Graphical Analysis and Presentation Graphics on pp. 68-69 in your own words.
Graphical Analysis is the step that comes before the Presentation Graphics.
The analysis is the part where one figures out what the dataset is about, figuring out the trend that data data fallows, at this point the visualization and the message that the plot transmits doesn't have to be 100% clear, as the person who is making the visualizations knows what he is looking at. While the presentation is more about transmitting the data to the audience in the most intuitive and easy to grasp way. At this point its more important that the message gets transmitted to the audience and that everything is clear, and self explanatory.

