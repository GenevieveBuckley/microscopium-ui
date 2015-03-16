var _ = require('lodash');

/**
 * SampleFilter: Setup sample filter.
 *
 * The constructor function adds all filters based on the current
 * sample data and attaches event listeners that drive behaviour filter.
 *
 * @constructor
 * @param {array} sampleData - The sample data for the screen. Each element
 *     in the array is an instance of a Sample document.
 */
function SampleFilter(sampleData) {
    $('.filter-items').children().remove();

    this.data = sampleData;
    this.uniqueCol = uniqueData(this.data, 'column');
    this.uniqueRow = uniqueData(this.data, 'row');
    this.uniquePlate = uniqueData(this.data, 'plate');
    this.genes = uniqueData(this.data, 'gene_name');
    this.selectedGenes = [];

    this.mountFilters();
    this.mountEventListeners();
    this.updateGeneList();
    $('#filter-button').removeClass('hidden');
}

/**
 * mountFilters: Add filter categories to the filter.
 *
 * Add the values the user can filter on.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.mountFilters = function() {
    // declare variables used in iterators
    var i;
    var j;
    var cols;
    var element;

    // append plate checkboxes
    j = 0;
    cols = Math.ceil(this.uniquePlate.length/2);
    for(i = 0; i < this.uniquePlate.length; i++) {
        element = '#plate-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'plate[' + [this.uniquePlate[i]] + ']',
            value: true,
            checked: true}).appendTo(element);
        $('<label />', { 'for': this.uniquePlate[i], text: this.uniquePlate[i] }).appendTo(element);
        $('<br />').appendTo(element);

        if((i+1) % cols === 0) {
            j++;
        }
    }

    // append row checkboxes
    j = 0;
    cols = Math.ceil(this.uniqueRow.length/2);
    for(i = 0; i < this.uniqueRow.length; i++) {
        element = '#row-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'row[' + [this.uniqueRow[i]] + ']',
            value: true,
            checked: true}).appendTo(element);
        $('<label />', { 'for': this.uniqueRow[i], text: this.uniqueRow[i] }).appendTo(element);
        $('<br />').appendTo(element);

        if((i+1) % cols === 0) {
            j++;
        }
    }

    // append column checkboxes
    j = 0;
    cols = Math.ceil(this.uniqueCol.length/3);
    for(i = 0; i < this.uniqueCol.length; i++) {
        element = '#col-' + (j+1);
        $('<input />', { type: 'checkbox',
            name: 'column[' + [this.uniqueCol[i]] + ']',
            value: true,
            checked: true}).appendTo(element);
        $('<label />', { 'for': this.uniqueCol[i], text: this.uniqueCol[i] }).appendTo(element);
        $('<br />').appendTo(element);

        if( (i+1) % cols === 0) {
            j++;
        }
    }
};

/**
 * mountEventListeners: Add event listeners to filter.
 *
 * Add event listeners to filter elements to drive the behaviour
 * of the filter UI.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.mountEventListeners = function() {
    var self = this;

    // add treatment to filter when arrow clicked
    $('#filter-add').on('click', function() {
        self.addToFilter();
    });

    // remove treatment from filter when arrow clicked
    $('#filter-remove').on('click', function() {
        self.removeFromFilter();
    });

    // attach enter key listener to text input box
    $('#gene-filter-text').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.addToFilter();
        }
    });

    // attach enter key listener to select box
    $('#gene-select').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.addToFilter();
        }
    });

    // attach enter key listener to selected box
    $('#gene-selected').on('keypress', function(event) {
        if(event.which === 13) {
            event.preventDefault();
            self.removeFromFilter();
        }
    });

    // update treatment 'search' value on input, paste
    $('#gene-filter-text').on('change keyup paste', function() {
        self.updateGeneList();
    });

    // attach additional behavior to reset button
    $('#filter-form').on('reset', function() {
        self.resetGeneFilter();
    });

    // update filter when checkbox (un)selected
    $(':checkbox').on('change', function() {
        self.applyFilter();
    });

    // allow only one menu open at a time
    $('#filter-menu a').on('click', function() {
        if(!$(this).next().hasClass('in')) {
            $('#filter-menu a').next().removeClass('in');
        }
    });
};

/**
 * addToFilter: Add gene to list of genes being filtered.
 *
 * Adds a gene to the list of genes currently being filtered,
 * then sets the selected genes to the next one on the list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.addToFilter = function() {
    var value = $('#gene-select option:selected').val();
    var nextValue =  $('#gene-select option:selected').next().val();
    var index = this.genes.indexOf(value);

    if(index !== -1 && value) {
        this.genes.splice(index, 1);
        this.selectedGenes.push(value);
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $('#gene-select').val(nextValue);
    this.applyFilter();
};

/**
 * removeFromFilter: Remove a gene from the list of genes being filtered.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.removeFromFilter = function() {
    var value = $('#gene-selected option:selected ').val();
    var nextValue =  $('#gene-selected option:selected').next().val();
    var index = this.selectedGenes.indexOf(value);

    if(index !== -1 && value) {
        this.selectedGenes.splice(index, 1);
        this.genes.push(value);
        this.genes.sort();
        this.updateGeneList();
        this.updateSelectedGeneList();
    }

    $('#gene-selected').val(nextValue);
    this.applyFilter();
};

/**
 * resetGeneFilter: Reset all selections in the filter.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.resetGeneFilter = function() {
    $('#gene-selected').children().remove();
    this.genes.push.apply(this.genes, this.selectedGenes);
    this.genes.sort();
    this.selectedGenes = [];
    this.updateGeneList();
    this.applyFilter();
};

/**
 * updateSelectedGeneList: Update genes displayed in genes list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.updateGeneList = function() {
    $('#gene-select').children().remove();

    var pattern = $('#gene-filter-text').val();
    var genesToDisplay;

    if(pattern) {
        genesToDisplay = _.filter(this.genes, regexFilter(pattern));
    }
    else {
        genesToDisplay = this.genes;
    }

    for(var i = 0; i < genesToDisplay.length; i++) {
        $('<option />', {
            value: genesToDisplay[i],
            text: genesToDisplay[i]
        }).appendTo('#gene-select');
    }
};

/**
 * updateSelectedGeneList: Update genes displayed in selected genes list.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.updateSelectedGeneList = function() {
    $('#gene-selected').children().remove();

    for(var i = 0; i < this.selectedGenes.length; i++) {
        $('<option />', {
            text: this.selectedGenes[i]
        }).appendTo('#gene-selected');
    }
};

/**
 * applyFilter: Apply current filter parameters to dataset and update plots.
 *
 * @this {SampleFilter}
 */
SampleFilter.prototype.applyFilter = function() {
    var filterQuery = $('form').serializeJSON();

    var rows = $.map(filterQuery.row, function(val, key) { return val; });
    var cols = $.map(filterQuery.column, function(val, key) { return val; });
    var plates = $.map(filterQuery.plate, function(val, key) { return val; });

    var rowActive = rows.length < this.uniqueRow.length;
    var colActive = cols.length < this.uniqueCol.length;
    var plateActive = plates.length < this.uniquePlate.length;
    var geneActive = this.selectedGenes.length > 0;

    if(geneActive || plateActive || rowActive || colActive) {
        $('#filter-button').addClass('filtering');
    }

    if(!geneActive && !plateActive && !rowActive && !colActive) {
        $('#filter-button').removeClass('filtering');
    }

    // TODO apply filter here
};

/**
 * regexFilter: Return regex function for use in filter.
 *
 * The function returned returns true if the query pattern is contained
 * in the element given to it. Case insensitive.
 *
 * @param {string} pattern - The query pattern.
 * @returns {Function} - The query function.
 */
function regexFilter(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'));
    };
}

/**
 * uniqueData: Return all unique data values.
 *
 * Given an array of objects, find all unique values for a specified key.
 * Uses lodash chained lodash methods.
 *
 * @param {array} data - An array of objects.
 * @param {string} key - The key to find the unique values of.
 * @returns {array} - An array of unique values.
 */
function uniqueData(data, field) {
    return _.uniq(_.pluck(_.flatten(data), field)).sort();
}

module.exports = SampleFilter;
