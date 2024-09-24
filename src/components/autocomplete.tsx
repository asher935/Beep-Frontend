import { useRef, useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { CgSpinner } from "react-icons/cg";
import {
    size,
    offset,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
    useClick,
    FloatingPortal,
    flip
} from '@floating-ui/react';


interface trueProps<T> {
    description?: string;
    disabled?: boolean;
    filterOptions?: (option: T[], inputValue: string) => T[];
    label?: string;
    loading?: boolean;
    multiple?: true;
    onChange?: (value: T[] | T) => void;
    onInputChange?: (value: T) => void;
    options: T[];
    placeholder?: string;
    renderOption?: (value: T) => React.ReactNode;
    renderTag?: (value: T) => React.ReactNode;
    value?: T[];
}

interface falseProps<T> {
    description?: string;
    disabled?: boolean;
    filterOptions?: (option: T[], inputValue: string) => T[];
    label?: string;
    loading?: boolean;
    multiple?: false;
    onChange?: (value: T) => void;
    onInputChange?: (value: T) => void;
    options: T[];
    placeholder?: string;
    renderOption?: (value: T) => React.ReactNode;
    value?: T;
}

type AutocompleteProps<T> = trueProps<T> | falseProps<T>

function defaultFilter(options: string[], inputValue: string) {
    return options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
    );
}

export default function Autocomplete<T>(
    props: AutocompleteProps<T>
) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredData, setFilteredData] = useState<T[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<T[]>([]);
    const [timer, setTimer] = useState(0);

    const optionIsString = typeof props.options[0] === 'string';

    useEffect(() => {
        if (inputValue.length > 0) {
            setOpen(true)
            if (props.loading) {
                setIsLoading(true)
                setTimer(1000)
            } else {
                setTimer(0)
            }

            const filter = setTimeout(() => {
                setIsLoading(false)

                const filtered = props.filterOptions ? props.filterOptions(props.options, inputValue) : optionIsString ? defaultFilter((props.options as string[]), inputValue) : []
                setFilteredData(filtered as T[])
            }, timer)

            return () => clearTimeout(filter)

        } else {
            setIsLoading(false)
            setFilteredData(props.options)
        }
    }, [inputValue])

    const { refs, floatingStyles, context } = useFloating({
        placement: "bottom",
        open: open,
        onOpenChange: setOpen,
        middleware: [
            offset(1),
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        minWidth: `${rects.reference.width}px`,
                        maxHeight: `300px`,
                    });
                },
                padding: 10
            }),
            flip({
                fallbackStrategy: "initialPlacement",
            }),
        ]
    });

    const listRef = useRef<Array<HTMLElement | null>>([]);
    const click = useClick(context, { toggle: false, });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "listbox" });

    const listNav = useListNavigation(context, {
        loop: true,
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, click]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        if (props.onInputChange) {
            props.onInputChange(event.target.value as T);
        }
    };

    const handleSelect = (option: T) => {
        if (props.multiple) {
            handleMultipleSelect(option);
            props.onChange && props.onChange(selectedOptions);
        } else {
            handleSingleSelect(option);
            props.onChange && props.onChange(option);
        }
    };

    const handleMultipleSelect = (option: T,) => {
        setSelectedOptions(prevSelected => {
            if (prevSelected.includes(option)) {
                return prevSelected.filter((item) => item !== option);
            } else {
                return [...prevSelected, option];
            }
        })

    };

    const handleSingleSelect = (option: T) => {
        setSelectedOptions([option]);
        if (optionIsString) {
            setInputValue(option as string)
        }
    };

    return (
        <>
            <fieldset className='items-start text-left '>
                <label className="">
                    {props.label}
                    <div className='relative w-full inline-flex items-center rounded-md shadow-sm mt-1'>
                        <CiSearch className='absolute left-0 ml-3' />
                        <input value={inputValue} disabled={props.disabled} onChange={handleInputChange}
                            type="text" className='w-full pl-10 py-2 border rounded-md outline-blue-500' placeholder={props.placeholder}
                            {...getReferenceProps({
                                ref: refs.setReference,
                                "aria-autocomplete": "list",
                                onKeyDown(event) {
                                    if (
                                        event.key === "Enter" &&
                                        activeIndex != null
                                    ) {
                                        if (!props.multiple) {
                                            setSelectedOptions([props.options[activeIndex]]);
                                        }
                                    }
                                }
                            })}
                        />

                        {(props.loading && isLoading) && <CgSpinner className="absolute right-0 mr-3 animate-spin" />}
                    </div>
                    <div className='text-sm mt-1'>
                        {props.description}
                    </div>
                </label>
            </fieldset>
            <FloatingPortal>
                {open &&
                    <div
                        aria-label="select"
                        className="bg-white rounded-md shadow-md z-20 mt-2 overflow-y-auto"
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                    >
                        {filteredData.map((option, index) => (
                            <label
                                key={index}
                                role="option"
                                tabIndex={activeIndex === index ? 0 : -1}
                                className={`flex w-full justify-between px-4 py-2 outline-none ${activeIndex === index ? 'bg-blue-100' : index % 2 != 0 && 'bg-slate-50'}`}
                                ref={(node) => {
                                    listRef.current[index] = node;
                                }}
                                {...getItemProps({
                                    onClick() {
                                        handleSelect(option)
                                    },
                                    // Handle keyboard select.
                                    onKeyDown(event) {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            handleSelect(option)
                                        }
                                    }
                                })}

                            >
                                <div className="flex w-full items-center justify-between">
                                    {props.renderOption ? props.renderOption(option) : optionIsString && <div className="text-gray-500 text-sm">{option as String}</div>}
                                    {props.multiple && <input type="checkbox" onChange={() => handleMultipleSelect(option)} checked={selectedOptions.includes(option)} className="w-4 h-4 text-blue-600 transition duration-150 ease-in-out form-checkbox" />}
                                </div>
                            </label>
                        ))}
                        {filteredData.length === 0 && <div className="text-gray-500 text-sm p-2">No results were found</div>}
                    </div>
                }

            </FloatingPortal>

        </>
    )
}