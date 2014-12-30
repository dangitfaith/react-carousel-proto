React.initializeTouchEvents(true);
var MySwipe = React.createFactory(Swipeable);

var IMAGES = [
    '/images/image1.jpg',
    '/images/image2.jpg',
    '/images/image3.jpg',
    '/images/image4.jpg',
    '/images/image5.jpg',
    '/images/image6.jpg'
];

var Carousel = React.createClass({displayName: "Carousel",

    propTypes: {
        items: React.PropTypes.array.isRequired,
        slideWidth: React.PropTypes.number.isRequired,
        slideHeight: React.PropTypes.number.isRequired,
        isVertical: React.PropTypes.bool
    },

    getInitialState: function() {
        return {
            index: 0,
            numSlides: 0,
            delta: 0,
            isSwiping: false
        }
    },

    setActiveIndex: function(index) {
        var max = this.state.numSlides;
        if (index > -1 && index < max) {
            this.setState({index: index});
        }
    },

    next: function(e) {
        e.preventDefault();
        var nextIndex = this.state.index + 1;
        if (nextIndex < this.state.numSlides) {
            this.setActiveIndex(nextIndex);
        }
    },

    prev: function(e) {
        e.preventDefault();
        var prevIndex = this.state.index - 1;
        if (prevIndex > -1) {
            this.setActiveIndex(prevIndex);
        }
    },

    componentDidMount: function() {
        var numSlides = this.props.items.length;
        this.setState({numSlides: numSlides});
    },

    calculateSlidePosition: function() {
        var width = this.props.slideWidth;
        var height = this.props.slideHeight;

        var isVertical = this.props.isVertical;

        var transformValue = (isVertical ? -this.state.index * height : -this.state.index * width) + this.state.delta;

        var transformCSS = (isVertical ? 'translateY' : 'translateX') + '(' + transformValue + 'px)';

        return {
            WebkitTransform: transformCSS,
            msTransform: transformCSS,
            transform: transformCSS,
            height: isVertical ? this.state.numSlides * height + 'px' : height,
            width: isVertical ? width : this.state.numSlides * width + 'px'
        };
    },

    moveCarouselLeft: function(e, delta) {
        e.preventDefault();
        if (this.props.isVertical) {
            return;
        }

        this.setState({isSwiping: true, delta: -delta});
    },

    moveCarouselRight: function(e, delta) {
        e.preventDefault();
        if (this.props.isVertical) {
            return;
        }
        this.setState({isSwiping: true, delta: delta});
    },

    moveCarouselUp: function(e, delta) {
        e.preventDefault();
        if (!this.props.isVertical) {
            return;
        }
        this.setState({isSwiping: true, delta: -delta});
    },

    moveCarouselDown: function(e, delta) {
        e.preventDefault();
        if (!this.props.isVertical) {
            return;
        }
        this.setState({isSwiping: true, delta: delta});
    },

    onSwiped: function(e, xDelta, yDelta, isFlicked) {
        this.setState({isSwiping: false, delta: 0});

        if (!isFlicked) {
            return;
        }

        var THRESHOLD = 25;
        if (this.props.isVertical) {
            if (yDelta < -THRESHOLD) {
                this.prev(e);
            } else if (yDelta > THRESHOLD) {
                this.next(e)
            }
        } else {
            if (xDelta < -THRESHOLD) {
                this.prev(e);
            } else if (xDelta > THRESHOLD) {
                this.next(e);
            }
        }
    },

    render: function() {
        var width = this.props.slideWidth;
        var height = this.props.slideHeight;

        var children = this.props.items.map(function(item, index) {
            return React.createElement(CarouselItem, {data: item, height: height, width: width});
        });

        var containerStyle = {
            width: width + 'px'
        };

        var slideWindowStyle = {
            height: height + 'px',
            width: width + 'px'
        };

        var slideListStyle = this.calculateSlidePosition();

        var swipeContainer = MySwipe({
            onSwiped: this.onSwiped,
            onSwipingLeft: this.moveCarouselLeft,
            onSwipingRight: this.moveCarouselRight,
            onSwipingUp: this.moveCarouselDown,
            onSwipingDown: this.moveCarouselUp,
            className: 'carousel__slides',
            style: slideListStyle
        }, children);

        return (
            React.createElement("div", {id: this.props.id, className: "carousel", style: containerStyle}, 
                React.createElement("div", {className: "carousel__window", style: slideWindowStyle}, 
                    swipeContainer
                ), 
                React.createElement(CarouselControl, {nextFunc: this.next, prevFunc: this.prev}), 
                React.createElement(CarouselPages, {setIndex: this.setActiveIndex, selectedIndex: this.state.index, data: this.props.items})
            )
        );
    }
});


var CarouselItem = React.createClass({displayName: "CarouselItem",
    propTypes: {
        height: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        data: React.PropTypes.string.isRequired
    },
    render: function() {
        return React.createElement("img", {className: "carousel__slide", height: this.props.height, width: this.props.width, src: this.props.data});
    }
});


var CarouselControl = React.createClass({displayName: "CarouselControl",
    propTypes: {
        nextFunc: React.PropTypes.func.isRequired,
        prevFunc: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            React.createElement("div", {className: "carousel__controls"}, 
                React.createElement("a", {className: "carousel__control carousel__control--prev", onClick: this.handlePrevious}, "Previous"), 
                React.createElement("a", {className: "carousel__control carousel__control--next", onClick: this.handleNext}, "Next")
            )
        );
    },

    handlePrevious: function(e) {
        this.props.prevFunc(e);
    },

    handleNext: function(e) {
        this.props.nextFunc(e)
    }
});


var CarouselPages = React.createClass({displayName: "CarouselPages",
    propTypes: {
        data: React.PropTypes.array.isRequired
    },

    updateIndex: function(index) {
        this.props.setIndex(index);
    },

    render: function() {
        var children = this.props.data.map(function(item, index) {
            var isSelected = this.props.selectedIndex === index;
            return (React.createElement(CarouselPager, {key: index, isSelected: isSelected, index: index, updateIndex: this.updateIndex}));
        }.bind(this));

        return (React.createElement("div", {className: "carousel__pages"}, 
            children
        ));
    }
});


var CarouselPager = React.createClass({displayName: "CarouselPager",
    propTypes: {
        index: React.PropTypes.number.isRequired
    },

    handleClick: function() {
        this.props.updateIndex(this.props.index);
    },

    render: function() {
        var classString = 'carousel__page';

        if (this.props.isSelected) {
            classString += ' carousel__page--selected';
        }

        return (React.createElement("a", {className: classString, onClick: this.handleClick}, this.props.index + 1));
    }
});

React.render(React.createElement(Carousel, {slideHeight: 350, slideWidth: 233, isVertical: false, items: IMAGES}), document.getElementById('normal'));
React.render(React.createElement(Carousel, {slideHeight: 350, slideWidth: 233, isVertical: true, items: IMAGES}), document.getElementById('vertical'));
