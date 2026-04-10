// src/pages/GemstoneDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { gemstoneDetailsInfoData } from "@/constants/product info data/gemstoneDetailsInfoData";
import { div } from "framer-motion/client";

const GemstoneDetail = () => {
    const { name } = useParams();
    const gem = gemstoneDetailsInfoData[name];

    if (!gem) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800">Gemstone not found</h2>
                    <p className="text-gray-600 mt-2">The gemstone "{name}" data is coming soon.</p>
                    <Link to="/gemstones" className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition">
                        ← Back to Gemstones
                    </Link>
                </div>
            </div>
        );
    }

    const renderPropertiesTable = (properties, title) => {
        if (!properties) return null;
        return (
            <section className="my-10">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-amber-500 pl-3 mb-5">{title}</h2>
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(properties).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 w-1/3 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-amber-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/gemstones" className="hover:text-amber-600">Gemstones</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{gem.name}</span>
                </div>

                {/* Heading */}
                <div className="mb-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-amber-700">{gem.name}</h1>
                    <p className="text-sm text-gray-600 mt-2">{gem.shortDesc}</p>
                </div>

                {/* Q&A Sections – each row: image floated right, text wraps around */}
                <div className="space-y-8">
                    {gem.sections.map((section, idx) => (
                        <div key={idx} className=" overflow-hidden">
                            <div className="p-6">
                                {/* Image floated right */}
                                <div className="float-right ml-6 mb-4 w-[50%]">
                                    <div className="bg-gray-100  p-3">
                                        <img
                                            src={section.image || "/images/gemstones/placeholder.jpg"}
                                            alt={`${gem.name} - ${section.title}`}
                                            className="w-full object-contain  "
                                            style={{ maxHeight: '250px' }}
                                        />
                                        {section.imageCaption && section.imageDiscription && (
                                            <div className="text-center mt-2">
                                                <span className="text-sm text-amber-500 italic">{section.imageCaption}</span>
                                                <span className="text-sm text-gray-500 italic ml-1">{section.imageDiscription}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Text content – will wrap around the floated image */}
                                <h3 className="text-xl font-bold text-amber-600 mb-3">{section.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{section.content}</p>
                                <div className="clear-both"></div> {/* Clear float after content */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Full width tables */}
                {renderPropertiesTable(gem.physicalProperties, `Physical Properties of ${gem.name}`)}
                {renderPropertiesTable(gem.opticalProperties, "Optical Properties")}

                {/* Birthstone, Zodiac, Anniversary info row */}
                {(gem.birthstone || gem.zodiac || gem.anniversary) && (
                    <div className="my-10 bg-amber-50 p-5 rounded-xl flex flex-wrap justify-around text-center">
                        {gem.birthstone && <div><span className="font-bold text-amber-800">Birthstone</span><br />{gem.birthstone}</div>}
                        {gem.zodiac && <div><span className="font-bold text-amber-800">Zodiac</span><br />{gem.zodiac}</div>}
                        {gem.anniversary && <div><span className="font-bold text-amber-800">Anniversary</span><br />{gem.anniversary}</div>}
                    </div>
                )}

                {/* FAQ */}
                {gem.faq && gem.faq.length > 0 && (
                    <section className="my-10">
                        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-amber-500 pl-3 mb-5">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {gem.faq.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800">{item.q}</p>
                                    <p className="text-gray-600 mt-1">✅ {item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trivia */}
                {gem.trivia && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded my-8 italic text-gray-700">
                        <span className="font-bold text-amber-700">Trivia:</span> {gem.trivia}
                    </div>
                )}

                {/* References */}
                {/* {gem.references && gem.references.length > 0 && (
                    <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
                        <h3 className="font-semibold text-gray-600 mb-1">References</h3>
                        <ul className="list-disc list-inside space-y-0.5">
                            {gem.references.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                            ))}
                        </ul>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default GemstoneDetail;