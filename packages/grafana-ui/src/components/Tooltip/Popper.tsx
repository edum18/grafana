import React, { PureComponent } from 'react';
import * as PopperJS from 'popper.js';
import { Manager, Popper as ReactPopper, PopperArrowProps } from 'react-popper';
import { Portal } from '../Portal/Portal';
import Transition from 'react-transition-group/Transition';
import { PopperContent } from './PopperController';

const defaultTransitionStyles = {
  //transition: 'opacity 0s linear', // alterado de: 'opacity 200ms linear',   Lá em baixo mudei o timeout para 0
  opacity: 0,
};

const transitionStyles: { [key: string]: object } = {
  exited: { opacity: 0 },
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 }, // alterado de '500ms'
};

export type RenderPopperArrowFn = (props: { arrowProps: PopperArrowProps; placement: string }) => JSX.Element;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  placement?: PopperJS.Placement;
  content: PopperContent<any>;
  referenceElement: PopperJS.ReferenceObject;
  wrapperClassName?: string;
  renderArrow?: RenderPopperArrowFn;
}

class Popper extends PureComponent<Props> {
  render() {
    const {
      content,
      show,
      placement,
      onMouseEnter,
      onMouseLeave,
      className,
      wrapperClassName,
      renderArrow,
    } = this.props;

    return (
      <Manager>
        <Transition in={show} timeout={0} mountOnEnter={true} unmountOnExit={true}>
          {transitionState => {
            return (
              <Portal>
                <ReactPopper
                  placement={placement}
                  referenceElement={this.props.referenceElement}
                  // TODO: move modifiers config to popper controller
                  modifiers={{ preventOverflow: { enabled: true, boundariesElement: 'window' } }}
                >
                  {({ ref, style, placement, arrowProps, scheduleUpdate }) => {
                    return (
                      <div
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        ref={ref}
                        style={{
                          ...style,
                          ...defaultTransitionStyles,
                          ...transitionStyles[transitionState],
                        }}
                        data-placement={placement}
                        className={`${wrapperClassName}`}
                      >
                        <div className={className}>
                          {typeof content === 'string' && content}
                          {React.isValidElement(content) && React.cloneElement(content)}
                          {typeof content === 'function' &&
                            content({
                              updatePopperPosition: scheduleUpdate,
                            })}
                          {renderArrow &&
                            renderArrow({
                              arrowProps,
                              placement,
                            })}
                        </div>
                      </div>
                    );
                  }}
                </ReactPopper>
              </Portal>
            );
          }}
        </Transition>
      </Manager>
    );
  }
}

export { Popper };
