/**
 * NeighbourImages: Object to get and set images in the gallery.
 *
 * @constructor
 */
function NeighbourImages() {
    this.neighbours = [];
    this.selectedImage = "";
    this.neighbourImages = [];
}

/**
 * getImages: Get med-size image for selected samples, and nearest
 * neighbour images.
 *
 * @this {NeighbourImages}
 * @params {string} - _id of the query sample
 */
NeighbourImages.prototype.getImages = function(query_id) {
    var self = this;

    $.when(
        $.ajax({
            url: '/api/sample/neighbours/' + query_id,
            async: false,
            success: function(json) {
                var neighboursLength = json[0].length;
                self.neighbours = json[0].neighbours.slice(1,
                    neighboursLength);
            }
        }),
        $.ajax({
            url: '/api/image/' + query_id,
            async: false,
            success: function(json) {
                self.selectedImage = json[0];
            }
        }),
        $.ajax({
            type: 'GET',
            url: '/api/images/',
            data: {
                'sample_ids': self.neighbours
            },
            async: false,
            success: function(json) {
                self.neighbourImages = json;
            }
        })).then(function(res, status) {
            self.setImages();
        });
};

/**
 * setImages: Convert base64 encoded strings to images and set them in the DOM.
 *
 * @this {NeighbourImages}
 */
NeighbourImages.prototype.setImages = function() {
    var self = this;

    $('#nebula-0').attr('src', 'data:image/jpg;base64,' + self.selectedImage.image_full);
    $('#nebula-0').attr('title', self.selectedImage.sample_id);

    for(var i = 0; i < self.neighbourImages.length; i++) {
        var nebula_selector = '#nebula-' + (i+1);
        $(nebula_selector).attr('src', 'data:image/jpg;base64,' + self.neighbourImages[i].image_thumb);
        $(nebula_selector).attr('title', self.neighbourImages[i].sample_id);
    }
};

module.exports = NeighbourImages;