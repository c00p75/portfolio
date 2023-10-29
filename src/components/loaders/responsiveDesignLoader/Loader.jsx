import './loader.css';

const Loader = () => {
	return (
		<div id="responsive-design-loader" className="flex-center">
			<div className="container position-relative">
				<div className="rd-loader" />
				<div className="rd-loader" />
				<div className="rd-loader" />
			</div>
		</div>
	);
};

export default Loader;
