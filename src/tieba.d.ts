const Env: {
    server_time: number;
};

const datalazyload: {
    userConfig: {
        diff: number;
        imgOnloadCallback: object;
        subListLoadCallback: object;
        placeholder: string;
        execScript: boolean;
        container: object;
        autoDestory: boolean;
    };

    _callbacks: object;
    _containerIsNotDocument: boolean;
    _images: HTMLImageElement[];
    _subList: HTMLDivElement[];
    _textareas: [];
    _codes: [];
};
