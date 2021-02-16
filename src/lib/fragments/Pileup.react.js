import React, {Component} from 'react';
import {propTypes, defaultProps} from '../components/Pileup.react';
import pileup from 'pileup';

/**
 * The Pileup component is an genome visualization component
 * developed by the the Hammerlab. It uses an
 * example integration of pileup.js and React (https://www.npmjs.com/package/pileup).
 */
export default class Pileup extends Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.pileup = null;
    }

    parseTracks(reference, tracks) {
        var referenceTrack = {
            viz: pileup.viz.genome(),
            isReference: true,
            data: pileup.formats.twoBit({
                url: reference.url,
            }),
            name: reference.label,
        };

        // make list of pileup sources
        var sources = [referenceTrack];

        // add in optional tracks
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];

            var newTrack = {
                viz: pileup.viz[track.viz](),
                isReference: false,
                data: null,
                name: track.label,
            };

            // Make sure source exists and it is a valid pileup format
            // Source may not exist for scale or location tracks
            if (('source' in track) & (pileup.formats[track.source] !== null)) {
                newTrack.data = pileup.formats[track.source](
                    track.sourceOptions
                );
            }
            sources.push(newTrack);
        }
        return sources;
    }

    createPileupBrowser() {
        var pileupContainer = this.ref.current;
        var pileupOptions = {
            range: this.props.range,
            tracks: this.parseTracks(this.props.reference, this.props.tracks),
        };
        console.log(pileupContainer);
        if (this.pileup !== null) {
            // destroy pileup if it currently exists
            this.pileup.destroy();
        }
        this.pileup = pileup.create(pileupContainer, pileupOptions);
    }

    componentDidMount() {
        console.log('component mounted');
        this.createPileupBrowser();
    }

    componentDidUpdate(prevProps) {
        if (this.props.tracks !== prevProps.tracks) {
            this.createPileupBrowser();
        } else if (this.props.range !== prevProps.range) {
            console.log('setting Range', this.props.range);
            console.log(this.props.range);

            try {
                this.pileup.setRange(this.props.range);
            } catch (error) {
                // sometimes the ReactElement in pileup.js is null,
                // keeping you from changing the range. In this case,
                // we have to just re-create the browser.
                console.error(error);
                this.createPileupBrowser();
            }
        }
    }

    render() {
        const {id, style} = this.props;

        return <div id={id} style={style} ref={this.ref} />;
    }
}

Pileup.defaultProps = defaultProps;
Pileup.propTypes = propTypes;